/**
 * Nubias API client
 * Calls the Hugging Face Gradio space at https://ano666-nubias.hf.space/
 *
 * The space runs Gradio 6.x with api_prefix="/gradio_api" and protocol="sse_v3".
 * Correct endpoints:
 *   POST /gradio_api/call/{api_name}          → { event_id }
 *   GET  /gradio_api/call/{api_name}/{id}     → SSE stream with result
 */

const BASE_URL = 'https://ano666-nubias.hf.space'
const API_PREFIX = '/gradio_api'

/**
 * Call a Gradio API endpoint and return the result data array.
 */
async function callGradio(apiName, inputData, onProgress) {
  // POST to submit the job
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

  // GET SSE stream to collect result
  // Gradio sse_v3 protocol sends named SSE events: "generating", "complete", "error", "heartbeat"
  return new Promise((resolve, reject) => {
    const sseUrl = `${BASE_URL}${API_PREFIX}/call/${apiName}/${event_id}`
    const es = new EventSource(sseUrl)

    const timeout = setTimeout(() => {
      es.close()
      reject(new Error('API timeout — no response after 60s. The Hugging Face space may be sleeping; try again in a moment.'))
    }, 60000)

    // sse_v3: named "complete" event carries the result as a JSON array
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

    // sse_v3: named "error" event
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

    // sse_v3: "generating" event signals the model is running
    es.addEventListener('generating', () => {
      onProgress?.('processing')
    })

    // Fallback: unnamed messages (older Gradio format)
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
      } catch {
        // Ignore non-JSON frames
      }
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
 *
 * @param {string} text - Raw job posting text
 * @param {Function} [onProgress] - Optional progress callback
 * @returns {{ biasAnalysis: string, flaggedWords: string, genderNeutralRewrite: string }}
 */
export async function detectBias(text, onProgress) {
  const data = await callGradio('bias_detection', [text], onProgress)
  return {
    biasAnalysis: data[0] ?? '',
    flaggedWords: data[1] ?? '',
    genderNeutralRewrite: data[2] ?? '',
  }
}

/**
 * Anonymise a CV or cover letter.
 *
 * @param {string} text - Raw CV / cover letter text
 * @param {Function} [onProgress] - Optional progress callback
 * @returns {{ surfaceAnonymized: string, fullyAnonymized: string }}
 */
export async function anonymizeDocument(text, onProgress) {
  const data = await callGradio('anonymize', [text], onProgress)
  return {
    surfaceAnonymized: data[0] ?? '',
    fullyAnonymized: data[1] ?? '',
  }
}
