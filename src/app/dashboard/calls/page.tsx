'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface CallLog {
  id: string
  caller_number: string
  call_duration: number
  transcript: string
  summary: string
  appointment_booked: boolean
  created_at: string
}

export default function CallLogsPage() {
  const [calls, setCalls] = useState<CallLog[]>([])
  const [filtered, setFiltered] = useState<CallLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    fetchCalls()
  }, [])

  useEffect(() => {
    let result = calls
    if (search) {
      result = result.filter(
        (c) =>
          c.caller_number.includes(search) ||
          c.summary?.toLowerCase().includes(search.toLowerCase())
      )
    }
    if (filter === 'booked') {
      result = result.filter((c) => c.appointment_booked)
    } else if (filter === 'not_booked') {
      result = result.filter((c) => !c.appointment_booked)
    }
    setFiltered(result)
  }, [search, filter, calls])

  const fetchCalls = async () => {
    const { data } = await supabase
      .from('call_logs')
      .select('*')
      .order('created_at', { ascending: false })
    setCalls(data || [])
    setFiltered(data || [])
    setLoading(false)
  }

  const formatDuration = (seconds: number) => {
    if (!seconds) return '0:00'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
        <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
        <p className="text-gray-500 mt-1">Every call Sarah handled — transcripts and summaries</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-gray-900">{calls.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Calls</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-emerald-600">
            {calls.filter((c) => c.appointment_booked).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Appointments Booked</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">
            {calls.length > 0
              ? Math.round(
                  (calls.filter((c) => c.appointment_booked).length /
                    calls.length) *
                    100
                )
              : 0}%
          </p>
          <p className="text-sm text-gray-500 mt-1">Conversion Rate</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by number or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Calls</option>
          <option value="booked">Appointment Booked</option>
          <option value="not_booked">No Appointment</option>
        </select>
      </div>

      {/* Call List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Phone className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">No calls yet</p>
            <p className="text-gray-300 text-sm mt-1">
              Calls will appear here once Sarah starts answering
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((call) => (
              <div key={call.id} className="p-5">

                {/* Call Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${call.appointment_booked ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                      <Phone className={`w-5 h-5 ${call.appointment_booked ? 'text-emerald-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{call.caller_number}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatDuration(call.call_duration)}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {formatDate(call.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {call.appointment_booked ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-xl border border-emerald-200">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Booked
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 text-xs font-medium rounded-xl border border-gray-200">
                        <XCircle className="w-3.5 h-3.5" />
                        No Booking
                      </span>
                    )}
                    <button
                      onClick={() =>
                        setExpanded(expanded === call.id ? null : call.id)
                      }
                      className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                      {expanded === call.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Summary */}
                {call.summary && (
                  <div className="mt-3 ml-14">
                    <p className="text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl">
                      {call.summary}
                    </p>
                  </div>
                )}

                {/* Expanded Transcript */}
                {expanded === call.id && call.transcript && (
                  <div className="mt-4 ml-14">
                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                      Full Transcript
                    </p>
                    <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {call.transcript}
                    </div>
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