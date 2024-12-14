// Fetch and display uploaded files
async function loadFiles() {
  const response = await fetch('/files');
  const files = await response.json();
  const fileList = document.getElementById('file-list');
  fileList.innerHTML = '';

  files.forEach(file => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const deleteButton = document.createElement('button');

    a.href = `/uploads/${file}`;
    a.textContent = file;
    a.target = '_blank';

    deleteButton.textContent = 'Ta bort';
    deleteButton.style.marginLeft = '10px';
    deleteButton.onclick = async () => {
      const password = prompt('Ange administratörens lösenord för att ta bort filen:');
      if (!password) return;

      const confirmed = confirm(`Är du säker på att du vill ta bort "${file}"?`);
      if (!confirmed) return;

      const response = await fetch('/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file, password })
      });

      if (response.ok) {
        alert(`Filen "${file}" har tagits bort.`);
        loadFiles();
      } else {
        const errorMessage = await response.text();
        alert(`Kunde inte ta bort filen: ${errorMessage}`);
      }
    };

    li.appendChild(a);
    li.appendChild(deleteButton);
    fileList.appendChild(li);
  });
}

// Load files on page load
loadFiles();
