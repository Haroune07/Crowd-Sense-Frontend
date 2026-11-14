// Small helpers used by several screens.

// "2 min", "1 h", "Yesterday"
export function timeAgo(date) {
  const seconds = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return minutes + ' min';
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours + ' h';
  return hours < 48 ? 'Yesterday' : Math.round(hours / 24) + ' days';
}

// Makes a phone photo smaller (about 800 px wide, JPEG) so it uploads fast on a bad network.
export function shrinkPhoto(file, maxWidth = 800) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Asks the phone for its position once. Resolves { lat, lng }.
export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not available on this device.'));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => reject(new Error('We need your location to place the report. Allow it in your browser settings.')),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}
