import React, { useEffect, useRef } from 'react';

const PhotoFrame = ({ photo, userName, location }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const theme = getComputedStyle(document.documentElement);
    const primaryColor = theme.getPropertyValue('--color-primary').trim() || '#005a32';
    const accentColor = theme.getPropertyValue('--color-accent').trim() || '#008f4c';
    const textColor = theme.getPropertyValue('--color-page-text').trim() || '#0f172a';
    const surfaceColor = theme.getPropertyValue('--color-surface').trim() || '#ffffff';

    // Set canvas size
    canvas.width = 600;
    canvas.height = 700;

    // Fill background
    ctx.fillStyle = surfaceColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawFrame = () => {
      const centerX = canvas.width / 2;
      const centerY = 300;
      const radius = 150;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.fillStyle = '#e5f5e9';
      ctx.fillRect(centerX - radius, centerY - radius, radius * 2, radius * 2);
      ctx.restore();

      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = primaryColor;
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Gift of Reading', centerX, 210);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 34px Arial';
      ctx.fillText(userName, centerX, 530);
      ctx.font = '18px Arial';
      ctx.fillText(location, centerX, 560);
    };

    const img = new Image();
    if (photo) {
      const imageUrl = typeof photo === 'string' ? photo : URL.createObjectURL(photo);
      img.onload = () => {
        const centerX = canvas.width / 2;
        const centerY = 300;
        const radius = 150;

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, centerX - radius, centerY - radius, radius * 2, radius * 2);
        ctx.restore();

        ctx.strokeStyle = primaryColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = primaryColor;
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('AKHSS Kharadar', centerX, 80);
        ctx.font = '20px Arial';
        ctx.fillText('100 Years Celebration', centerX, 110);
        ctx.font = 'bold 26px Arial';
        ctx.fillStyle = accentColor;
        ctx.fillText('Gift of Reading', centerX, 500);
        ctx.font = '18px Arial';
        ctx.fillStyle = textColor;
        ctx.fillText(location, centerX, 540);
        ctx.font = 'bold 22px Arial';
        ctx.fillText(userName, centerX, 580);
      };
      img.src = imageUrl;
    } else {
      drawFrame();
    }
  }, [photo, userName, location]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `gift-of-reading-${userName.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h3 style={{ marginBottom: '15px', color: 'var(--color-page-text)' }}>Your Reading Frame Preview</h3>
      <canvas 
        ref={canvasRef} 
        style={{ 
          maxWidth: '100%', 
          border: '2px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-button)'
        }}
      />
      <div style={{ marginTop: '15px' }}>
        <button onClick={handleDownload} className="btn">
          📥 Download Frame
        </button>
      </div>
    </div>
  );
};

export default PhotoFrame;
