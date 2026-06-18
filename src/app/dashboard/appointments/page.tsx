'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Calendar,
  Clock,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter
} from 'lucide-react'

interface Appointment {
  id: string
  patient_name: string
  patient_phone: string
  service: string
  appointment_date: string
  appointment_time: string
  status: string
  notes: string
  created_at: string
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filtered, setFiltered] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    fetchAppointments()
  }, [])

  useEffect(() => {
    let result = appointments
    if (search) {
      result = result.filter(
        (a) =>
          a.patient_name.toLowerCase().includes(search.toLowerCase()) ||
          a.service.toLowerCase().includes(search.toLowerCase()) ||
          a.patient_phone.includes(search)
      )
    }
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }
    setFiltered(result)
  }, [search, statusFilter, appointments])

  const fetchAppointments = async () => {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at', { ascending: false })
    setAppointments(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
    await fetchAppointments()
    setUpdating(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
      case 'cancelled':
        return 'bg-red-50 text-red-700 border border-red-200'
      default:
        return 'bg-amber-50 text-amber-700 border border-amber-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-3.5 h-3.5" />
      case 'cancelled':
        return <XCircle className="w-3.5 h-3.5" />
      default:
        return <AlertCircle className="w-3.5 h-3.5" />
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 mt-1">Manage and update all patient appointments</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, service, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No appointments found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((apt) => (
              <div
                key={apt.id}
                className="p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                  {/* Patient Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-600 font-semibold">
                        {apt.patient_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{apt.patient_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Phone className="w-3 h-3" />
                          {apt.patient_phone}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">{apt.service}</span>
                      </div>
                    </div>
                  </div>

                  {/* Date, Time, Status */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {apt.appointment_date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {apt.appointment_time}
                    </div>
                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusBadge(apt.status)}`}>
                      {getStatusIcon(apt.status)}
                      {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {apt.notes && (
                  <div className="mt-3 ml-15 pl-15">
                    <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                      📝 {apt.notes}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                {apt.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => updateStatus(apt.id, 'confirmed')}
                      disabled={updating === apt.id}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {updating === apt.id ? 'Updating...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => updateStatus(apt.id, 'cancelled')}
                      disabled={updating === apt.id}
                      className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}

                {/* Revert to pending if confirmed or cancelled */}
                {apt.status !== 'pending' && (
                  <div className="mt-4">
                    <button
                      onClick={() => updateStatus(apt.id, 'pending')}
                      disabled={updating === apt.id}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Revert to Pending
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}