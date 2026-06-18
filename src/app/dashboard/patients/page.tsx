'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  Phone,
  Calendar,
  Search,
  Clock,
  Trash2
} from 'lucide-react'

interface Appointment {
  id: string
  service: string
  appointment_date: string
  appointment_time: string
  status: string
}

interface Patient {
  id: string
  full_name: string
  phone: string
  email: string
  created_at: string
  appointments?: Appointment[]
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [filtered, setFiltered] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Patient | null>(null)

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    if (search) {
      setFiltered(
        patients.filter(
          (p) =>
            p.full_name.toLowerCase().includes(search.toLowerCase()) ||
            p.phone.includes(search)
        )
      )
    } else {
      setFiltered(patients)
    }
  }, [search, patients])

  const fetchPatients = async () => {
    const { data } = await supabase
      .from('patients')
      .select(`
        *,
        appointments (
          id,
          service,
          appointment_date,
          appointment_time,
          status
        )
      `)
      .order('created_at', { ascending: false })
    setPatients(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const deletePatient = async (id: string) => {
    if (!confirm('Delete this patient and all their appointments?')) return
    await supabase.from('appointments').delete().eq('patient_id', id)
    await supabase.from('patients').delete().eq('id', id)
    setSelected(null)
    await fetchPatients()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-emerald-50 text-emerald-700'
      case 'cancelled': return 'bg-red-50 text-red-700'
      default: return 'bg-amber-50 text-amber-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-500 mt-1">View all patients and their appointment history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Patient List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search patients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No patients found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {filtered.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => setSelected(patient)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selected?.id === patient.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-semibold text-sm">
                        {patient.full_name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{patient.full_name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-500">{patient.phone}</p>
                      </div>
                    </div>
                    <div className="ml-auto shrink-0">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-medium">
                        {patient.appointments?.length || 0} visits
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Patient Detail */}
        <div className="lg:col-span-2">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
              <Users className="w-14 h-14 text-gray-200 mb-3" />
              <p className="text-gray-400">Select a patient to view details</p>
            </div>
          ) : (
            <div className="space-y-4">

              {/* Patient Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-2xl">
                        {selected.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selected.full_name}</h2>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Phone className="w-4 h-4" />
                          {selected.phone}
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          Patient since {new Date(selected.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deletePatient(selected.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Patient
                  </button>
                </div>
              </div>

              {/* Appointment History */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Appointment History</h3>
                </div>
                {!selected.appointments || selected.appointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No appointments yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {selected.appointments.map((apt) => (
                      <div key={apt.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{apt.service}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <p className="text-sm text-gray-500">
                              {apt.appointment_date} at {apt.appointment_time}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                          {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}