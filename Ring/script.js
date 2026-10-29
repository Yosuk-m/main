const viewer = document.querySelector('#viewer');
const viewerImage = document.querySelector('#viewer-image');
const viewerTitle = document.querySelector('#viewer-title');

document.querySelectorAll('.poster').forEach((button) => {
  button.addEventListener('click', () => {
    viewerImage.src = button.dataset.src;
    viewerImage.alt = button.dataset.title;
    viewerTitle.textContent = button.dataset.title;
    viewer.showModal();
  });
});

document.querySelector('#close').addEventListener('click', () => viewer.close());
viewer.addEventListener('click', (event) => {
  if (event.target === viewer) viewer.close();
});
