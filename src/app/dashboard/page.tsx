'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Calendar,
  Users,
  Phone,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

interface Stats {
  totalAppointments: number
  pendingAppointments: number
  confirmedAppointments: number
  cancelledAppointments: number
  totalPatients: number
  totalCalls: number
  todayAppointments: number
  callsWithBooking: number
}

interface Appointment {
  id: string
  patient_name: string
  service: string
  appointment_date: string
  appointment_time: string
  status: string
  created_at: string
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({
    totalAppointments: 0,
    pendingAppointments: 0,
    confirmedAppointments: 0,
    cancelledAppointments: 0,
    totalPatients: 0,
    totalCalls: 0,
    todayAppointments: 0,
    callsWithBooking: 0,
  })
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })

      const [
        { count: totalAppointments },
        { count: pendingAppointments },
        { count: confirmedAppointments },
        { count: cancelledAppointments },
        { count: totalPatients },
        { count: totalCalls },
        { count: callsWithBooking },
        { data: recent },
      ] = await Promise.all([
        supabase.from('appointments').select('*', { count: 'exact', head: true }),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'confirmed'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('status', 'cancelled'),
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('call_logs').select('*', { count: 'exact', head: true }),
        supabase.from('call_logs').select('*', { count: 'exact', head: true }).eq('appointment_booked', true),
        supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5),
      ])

      setStats({
        totalAppointments: totalAppointments || 0,
        pendingAppointments: pendingAppointments || 0,
        confirmedAppointments: confirmedAppointments || 0,
        cancelledAppointments: cancelledAppointments || 0,
        totalPatients: totalPatients || 0,
        totalCalls: totalCalls || 0,
        todayAppointments: 0,
        callsWithBooking: callsWithBooking || 0,
      })

      setRecentAppointments(recent || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Total Appointments',
      value: stats.totalAppointments,
      icon: Calendar,
      color: 'bg-blue-500',
      light: 'bg-blue-50',
      text: 'text-blue-600'
    },
    {
      label: 'Total Patients',
      value: stats.totalPatients,
      icon: Users,
      color: 'bg-emerald-500',
      light: 'bg-emerald-50',
      text: 'text-emerald-600'
    },
    {
      label: 'Total Calls',
      value: stats.totalCalls,
      icon: Phone,
      color: 'bg-violet-500',
      light: 'bg-violet-50',
      text: 'text-violet-600'
    },
    {
      label: 'Calls Converted',
      value: stats.callsWithBooking,
      icon: TrendingUp,
      color: 'bg-amber-500',
      light: 'bg-amber-50',
      text: 'text-amber-600'
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-emerald-500" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />
      default: return <AlertCircle className="w-4 h-4 text-amber-500" />
    }
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

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good morning, Dr. Smith 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening at Bright Smile Dental today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 ${card.light} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${card.text}`} />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.label}</p>
            </div>
          )
        })}
      </div>

      {/* Appointment Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingAppointments}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.confirmedAppointments}</p>
            <p className="text-sm text-gray-500">Confirmed</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.cancelledAppointments}</p>
            <p className="text-sm text-gray-500">Cancelled</p>
          </div>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Appointments</h2>
        </div>
        {recentAppointments.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No appointments yet</p>
            <p className="text-gray-300 text-sm mt-1">Appointments will appear here once calls come in</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentAppointments.map((apt) => (
              <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {apt.patient_name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{apt.patient_name}</p>
                    <p className="text-sm text-gray-500">{apt.service}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-700">{apt.appointment_date}</p>
                    <p className="text-xs text-gray-400">{apt.appointment_time}</p>
                  </div>
                  <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                    {getStatusIcon(apt.status)}
                    {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}