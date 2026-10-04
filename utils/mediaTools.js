function ffmpegToWebp(inputBuffer, { inputExt = 'bin', video = false } = {}) {
  const tempDir = makeTempDir();
  const inputFile = path.join(tempDir, `input.${inputExt}`);
  const outputFile = path.join(tempDir, 'output.webp');

  try {
    fs.writeFileSync(inputFile, inputBuffer);

    const args = [
      '-y',
      '-i', inputFile,
      '-vcodec', 'libwebp',
      '-vf',
      'fps=15,scale=512:512:force_original_aspect_ratio=decrease:flags=lanczos,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000',
      '-lossless', '1',
      '-qscale', '50',
      '-preset', 'default',
      '-pix_fmt', 'yuva420p',
      '-loop', '0',
      '-an',
      '-vsync', '0'
    ];

    if (video) {
      args.push('-t', '7');
    }

    args.push(outputFile);

    execFileSync('ffmpeg', args, {
      stdio: ['ignore', 'ignore', 'pipe']
    });

    const result = fs.readFileSync(outputFile);

    if (!result || result.length < 100) {
      throw new Error('WEBP inválido');
    }

    return result;
  } finally {
    try {
      fs.rmSync(tempDir, {
        recursive: true,
        force: true
      });
    } catch {}
  }
}