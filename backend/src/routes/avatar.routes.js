const router = require('express').Router();

const HF_TOKEN = process.env.HF_TOKEN;

// Submission endpoint — HF router queues the job
const SUBMIT_URL = 'https://router.huggingface.co/fal-ai/fal-ai/qwen-image-edit-plus?_subdomain=queue';

/**
 * POST /api/avatar/generate
 * Body: { imageBase64: string (data URL), prompt: string }
 *
 * Mimics the @huggingface/inference SDK imageToImage call:
 *   - submits as multipart/form-data with raw image bytes
 *   - polls response_url with Bearer token until image is ready
 *   - returns final image binary to the frontend
 */
router.post('/generate', async (req, res) => {
  try {
    const { imageBase64, prompt } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'imageBase64 is required' });
    if (!HF_TOKEN)    return res.status(500).json({ error: 'HF_TOKEN not set in server environment' });

    const finalPrompt = prompt ||
      'Transform this person into an animated cartoon avatar, cool neon background, ' +
      'studio lighting, vibrant colors, digital art style, high resolution';

    // Convert base64 data URL → raw Buffer
    const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
    const imgBuffer  = Buffer.from(base64Data, 'base64');

    console.log(`[avatar] Submitting — prompt: "${finalPrompt.slice(0, 60)}..." | image: ${imgBuffer.length} bytes`);

    // ── Step 1: Submit job via multipart form (same as SDK) ───────────────
    // Build multipart/form-data manually (no extra deps needed)
    const boundary = `----FormBoundary${Date.now()}`;

    const formParts = [
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="inputs"; filename="selfie.jpg"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n`,
      imgBuffer,
      `\r\n--${boundary}\r\n` +
      `Content-Disposition: form-data; name="parameters"\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      JSON.stringify({ prompt: finalPrompt }) +
      `\r\n--${boundary}--\r\n`
    ];

    const formBody = Buffer.concat(
      formParts.map(p => Buffer.isBuffer(p) ? p : Buffer.from(p, 'utf8'))
    );

    const submitRes = await fetch(SUBMIT_URL, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type':  `multipart/form-data; boundary=${boundary}`,
      },
      body: formBody,
    });

    const submitCT  = submitRes.headers.get('content-type') || '';
    const submitBuf = Buffer.from(await submitRes.arrayBuffer());
    console.log(`[avatar] Submit → ${submitRes.status} ${submitCT} | body: ${submitBuf.slice(0,150).toString()}`);

    if (!submitRes.ok) {
      let errMsg = `Submit error ${submitRes.status}`;
      try { errMsg = JSON.parse(submitBuf.toString())?.error ?? errMsg; } catch {}
      return res.status(submitRes.status).json({ error: errMsg });
    }

    // Immediate binary response
    if (submitCT.startsWith('image/')) {
      res.setHeader('Content-Type', submitCT);
      res.setHeader('Cache-Control', 'no-store');
      return res.send(submitBuf);
    }

    // Parse queue response
    let queueJson;
    try { queueJson = JSON.parse(submitBuf.toString()); }
    catch { return res.status(500).json({ error: 'Unparseable submit response', raw: submitBuf.slice(0,200).toString() }); }

    const { request_id, response_url } = queueJson;
    if (!request_id || !response_url) {
      // Maybe direct JSON result
      const imgUrl = queueJson?.image?.url ?? queueJson?.images?.[0]?.url ?? queueJson?.output ?? null;
      if (imgUrl) return await _fetchAndSendImage(imgUrl, res);
      return res.status(500).json({ error: 'No request_id in queue response', raw: queueJson });
    }

    console.log(`[avatar] Queued → request_id: ${request_id}`);
    console.log(`[avatar] response_url: ${response_url}`);

    // ── Step 2: Poll response_url with Bearer token (same as SDK) ─────────
    const imageBuffer = await _pollResponseUrl(response_url, HF_TOKEN);
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Cache-Control', 'no-store');
    res.send(imageBuffer);

  } catch (err) {
    console.error('[avatar] Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

/**
 * Polls response_url every 3s until we get an image or a JSON result with an image URL.
 * Max 40 attempts = 2 minutes.
 */
async function _pollResponseUrl(responseUrl, token) {
  const maxAttempts = 40;

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000));

    console.log(`[avatar/poll] attempt ${i + 1} → ${responseUrl}`);

    const pollRes = await fetch(responseUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const ct  = pollRes.headers.get('content-type') || '';
    const buf = Buffer.from(await pollRes.arrayBuffer());

    console.log(`[avatar/poll] → ${pollRes.status} ${ct} | ${buf.slice(0, 120).toString()}`);

    // Got binary image directly
    if (ct.startsWith('image/')) return buf;

    if (!pollRes.ok && pollRes.status !== 400 && pollRes.status !== 422) {
      throw new Error(`Poll error ${pollRes.status}`);
    }

    let json;
    try { json = JSON.parse(buf.toString()); } catch { continue; }

    // Check for image in response
    const imgUrl =
      json?.image?.url        ??
      json?.images?.[0]?.url  ??
      json?.images?.[0]       ??   // sometimes it's a direct URL string
      json?.output            ??
      json?.generated_image   ??
      null;

    if (imgUrl && typeof imgUrl === 'string') {
      if (imgUrl.startsWith('http')) {
        console.log(`[avatar/poll] Got image URL: ${imgUrl}`);
        const imgRes = await fetch(imgUrl);
        return Buffer.from(await imgRes.arrayBuffer());
      }
      // base64
      return Buffer.from(imgUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    }

    const status = json?.status ?? 'UNKNOWN';
    console.log(`[avatar/poll] status: ${status} | keys: ${Object.keys(json).join(', ')}`);

    if (status === 'FAILED' || status === 'ERROR') {
      throw new Error(`Generation failed: ${JSON.stringify(json?.error ?? json?.detail ?? 'unknown')}`);
    }
    // IN_QUEUE / IN_PROGRESS — keep polling
  }
  throw new Error('Timed out waiting for image generation (2 min). Please try again.');
}

async function _fetchAndSendImage(imgUrl, res) {
  const imgRes = await fetch(imgUrl);
  const imgBuf = Buffer.from(await imgRes.arrayBuffer());
  res.setHeader('Content-Type', imgRes.headers.get('content-type') || 'image/jpeg');
  res.setHeader('Cache-Control', 'no-store');
  return res.send(imgBuf);
}

module.exports = router;
