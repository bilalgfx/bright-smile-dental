import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Only process end-of-call reports
    if (body.message?.type !== 'end-of-call-report') {
      return NextResponse.json({ received: true })
    }

    const call = body.message
    const transcript = call.transcript || ''
    const duration = call.durationSeconds || 0
    const callerNumber = call.customer?.number || 'Unknown'
    const summary = call.summary || ''

    // Extract appointment details from transcript using simple parsing
    const appointmentDetails = extractAppointmentDetails(transcript)

    let appointmentId = null

    // If appointment was booked save it
    if (appointmentDetails.booked) {
      // First create or find patient
      const { data: existingPatient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('phone', appointmentDetails.phone || callerNumber)
        .single()

      let patientId = existingPatient?.id

      if (!patientId) {
        const { data: newPatient } = await supabaseAdmin
          .from('patients')
          .insert({
            full_name: appointmentDetails.name || 'Unknown',
            phone: appointmentDetails.phone || callerNumber,
          })
          .select('id')
          .single()
        patientId = newPatient?.id
      }

      // Save appointment
      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .insert({
          patient_id: patientId,
          patient_name: appointmentDetails.name || 'Unknown',
          patient_phone: appointmentDetails.phone || callerNumber,
          service: appointmentDetails.service || 'General Consultation',
          appointment_date: appointmentDetails.date || 'To Be Confirmed',
          appointment_time: appointmentDetails.time || 'To Be Confirmed',
          status: 'pending',
          notes: summary,
        })
        .select('id')
        .single()

      appointmentId = appointment?.id
    }

    // Always save call log
    await supabaseAdmin
      .from('call_logs')
      .insert({
        caller_number: callerNumber,
        call_duration: duration,
        transcript: transcript,
        summary: summary,
        appointment_booked: appointmentDetails.booked,
        appointment_id: appointmentId,
      })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 })
  }
}

function extractAppointmentDetails(transcript: string) {
  const lower = transcript.toLowerCase()

  // Check if appointment was booked
  const booked =
    lower.includes('confirmed') ||
    lower.includes('appointment is set') ||
    lower.includes('see you') ||
    lower.includes('all set') ||
    lower.includes('booked') ||
    lower.includes('scheduled') ||
    lower.includes('great, we have you') ||
    lower.includes('got you down') ||
    lower.includes('you are all set') ||
    lower.includes('we will see you') ||
    lower.includes('appointment has been') ||
    lower.includes('looking forward')

  // Extract name - looks for patterns like "my name is John" or "I'm John"
  const nameMatch =
    transcript.match(/my name is ([A-Z][a-z]+ [A-Z][a-z]+)/i) ||
    transcript.match(/i'm ([A-Z][a-z]+ [A-Z][a-z]+)/i) ||
    transcript.match(/this is ([A-Z][a-z]+ [A-Z][a-z]+)/i)
  const name = nameMatch ? nameMatch[1] : null

  // Extract phone number
  const phoneMatch = transcript.match(
    /(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/
  )
  const phone = phoneMatch ? phoneMatch[1] : null

  // Extract service
  let service = 'General Consultation'
  if (lower.includes('cleaning')) service = 'Teeth Cleaning'
  else if (lower.includes('whitening')) service = 'Whitening'
  else if (lower.includes('filling')) service = 'Filling'
  else if (lower.includes('root canal')) service = 'Root Canal'
  else if (lower.includes('emergency')) service = 'Emergency'
  else if (lower.includes('checkup') || lower.includes('check-up'))
    service = 'Checkup'

  // Extract date
  const dateMatch =
    transcript.match(
      /(monday|tuesday|wednesday|thursday|friday|saturday)/i
    ) ||
    transcript.match(/(\w+ \d{1,2}(?:st|nd|rd|th)?)/i)
  const date = dateMatch ? dateMatch[1] : null

  // Extract time
  const timeMatch =
    transcript.match(/(\d{1,2}:\d{2}\s*(?:am|pm))/i) ||
    transcript.match(/(\d{1,2}\s*(?:am|pm))/i) ||
    transcript.match(/(noon|midnight|morning|afternoon|evening)/i)
  const time = timeMatch ? timeMatch[1] : null

  return { booked, name, phone, service, date, time }
}