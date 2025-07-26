const input = document.getElementById('repo-input');
const autocompleteList = document.getElementById('autocomplete-list');
const reposContainer = document.getElementById('repositories');

let debounceTimeout = null;

const addedRepositories = [];

async function fetchRepositories(query) {
  const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error('Ошибка', response.status);
      return [];
    }

    const data = await response.json();

    return data.items || [];

  } catch (error) {
    console.error('Ошибка', error);
    return [];
  }
}

input.addEventListener('input', () => {

  if (debounceTimeout) clearTimeout(debounceTimeout);

  if (input.value.trim() === '') {
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';
    return;
  }

  debounceTimeout = setTimeout(async () => {

    const query = input.value.trim();

    if (query === '') {
      autocompleteList.innerHTML = '';
      autocompleteList.style.display = 'none';
      return;
    }

    const repos = await fetchRepositories(query);

    autocompleteList.innerHTML = '';

    if (repos.length === 0) {
      autocompleteList.style.display = 'none';
      return;
    }

    repos.forEach(repo => {
      const item = document.createElement('li');
      item.className = 'autocomplete-item';
      item.textContent = `${repo.name} (${repo.owner.login})`;

      item.addEventListener('click', () => {
        addRepository(repo);
        input.value = '';
        autocompleteList.innerHTML = '';
        autocompleteList.style.display = 'none';
      });

      autocompleteList.appendChild(item);
    });

    autocompleteList.style.display = 'block';

  }, 200);

});

function addRepository(repo) {

  if (addedRepositories.some(r => r.id === repo.id)) return;

  addedRepositories.push(repo);

  const repoLi = document.createElement('li');
  repoLi.className = 'repo-item';

  const infoDiv = document.createElement('div');
  infoDiv.className = 'repo-info';

  infoDiv.innerHTML = `
     <span>Name:${repo.name}</span>
     <span>Owner: ${repo.owner.login}</span>
     <span>Stars: ${repo.stargazers_count}</span>
   `;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';

  deleteBtn.addEventListener('click', () => {
    reposContainer.removeChild(repoLi);
    const index = addedRepositories.findIndex(r => r.id === repo.id);
    if (index !== -1) addedRepositories.splice(index, 1);
  });

  repoLi.appendChild(infoDiv);
  repoLi.appendChild(deleteBtn);

  reposContainer.appendChild(repoLi);
}