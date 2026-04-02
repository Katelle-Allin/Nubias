/**
 * Nubias API client
 * Space: https://madeofstone-nubiasv2.hf.space/
 * Protocol: Gradio 6.x — api_prefix="/gradio_api", sse_v3
 *
 * Endpoints:
 *   /bias_detection  → 6 outputs: biasAnalysis, flaggedWords, rewrite, sustainability, history, totals
 *   /anonymize       → 5 outputs: surface, full, sustainability, history, totals
 *   /refresh_sustainability → 2 outputs: history, totals
 */

const BASE_URL = 'https://madeofstone-nubiasv2.hf.space'
const API_PREFIX = '/gradio_api'

async function callGradio(apiName, inputData, onProgress) {
  const submitRes = await fetch(`${BASE_URL}${API_PREFIX}/call/${apiName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: inputData }),
  })

  if (!submitRes.ok) {
    const text = await submitRes.text().catch(() => submitRes.status)
    throw new Error(`API submit failed (${submitRes.status}): ${text}`)
  }

  const { event_id } = await submitRes.json()
  if (!event_id) throw new Error('No event_id returned from API')

  return new Promise((resolve, reject) => {
    const sseUrl = `${BASE_URL}${API_PREFIX}/call/${apiName}/${event_id}`
    const es = new EventSource(sseUrl)

    const timeout = setTimeout(() => {
      es.close()
      reject(new Error('API timeout — no response after 60s. The Hugging Face space may be sleeping; try again in a moment.'))
    }, 60000)

    es.addEventListener('complete', (event) => {
      clearTimeout(timeout)
      es.close()
      try {
        const data = JSON.parse(event.data)
        resolve(Array.isArray(data) ? data : data.data ?? [])
      } catch {
        reject(new Error('Failed to parse API response'))
      }
    })

    es.addEventListener('error', (event) => {
      clearTimeout(timeout)
      es.close()
      try {
        const payload = JSON.parse(event.data)
        reject(new Error(payload.message ?? payload.error ?? 'API error'))
      } catch {
        reject(new Error('AI model returned an error'))
      }
    })

    es.addEventListener('generating', () => {
      onProgress?.('processing')
    })

    // Fallback for older Gradio format
    es.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if (payload.msg === 'process_completed') {
          clearTimeout(timeout)
          es.close()
          resolve(payload.output?.data ?? payload.data ?? [])
        } else if (payload.msg === 'queue_full') {
          clearTimeout(timeout)
          es.close()
          reject(new Error('AI model queue is full — please try again in a moment.'))
        }
      } catch { /* ignore */ }
    }

    es.onerror = () => {
      clearTimeout(timeout)
      es.close()
      reject(new Error('Connection to AI model was interrupted. Check your internet connection and try again.'))
    }
  })
}

/**
 * Analyse a job posting for gender bias.
 * @returns {{ biasAnalysis, flaggedWords, genderNeutralRewrite, sustainability, requestHistory, sessionTotals }}
 */
export async function detectBias(text, onProgress) {
  const data = await callGradio('bias_detection', [text], onProgress)
  return {
    biasAnalysis:        data[0] ?? '',
    flaggedWords:        data[1] ?? '',
    genderNeutralRewrite: data[2] ?? '',
    sustainability:      data[3] ?? '',
    requestHistory:      data[4] ?? '',
    sessionTotals:       data[5] ?? '',
  }
}

/**
 * Anonymise a CV or cover letter.
 * @returns {{ surfaceAnonymized, fullyAnonymized, sustainability, requestHistory, sessionTotals }}
 */
export async function anonymizeDocument(text, onProgress) {
  const data = await callGradio('anonymize', [text], onProgress)
  return {
    surfaceAnonymized: data[0] ?? '',
    fullyAnonymized:   data[1] ?? '',
    sustainability:    data[2] ?? '',
    requestHistory:    data[3] ?? '',
    sessionTotals:     data[4] ?? '',
  }
}

/**
 * Refresh the sustainability tab manually.
 * @returns {{ requestHistory, sessionTotals }}
 */
export async function refreshSustainability() {
  const data = await callGradio('refresh_sustainability', [], null)
  return {
    requestHistory: data[0] ?? '',
    sessionTotals:  data[1] ?? '',
  }
}
