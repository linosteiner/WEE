document.addEventListener("DOMContentLoaded", () => {
  navigate('home');

  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = e.target.getAttribute('data-target');
      navigate(target);
    });
  });
});

function navigate(view) {
  const app = document.getElementById('app');

  document.querySelectorAll('nav a').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-target') === view) {
      link.classList.add('active');
    }
  });

  switch (view) {
    case 'home':
      renderHome(app);
      break;
    case 'calculator':
      renderCalculator(app);
      break;
    case 'categories':
      renderCategories(app);
      break;
    case 'statistics':
      renderStatistics(app);
      break;
    default:
      renderHome(app);
  }
}


function renderHome(container) {
  container.innerHTML = `
        <h1>FitApp</h1>
        <div id="hero">
            <p>Willkommen zu FitApp!</p>
            <p>
                Das ist eine simple Webapplikation zum Thema "BMI".
                BMI steht für Body-Mass-Index und ist ein Wert, der sich vom Gewicht und der Grösse einer Person ableiten lässt.
            </p>
            <p>Die Formel zum Berechnen des BMI lautet:</p>
            <p>
                <math display="inline">
                    <mi>BMI</mi>
                    <mo>=</mo>
                    <mfrac>
                        <msub><ms>mass</ms><msub>kg</msub></msub>
                        <msub><ms>height</ms><msup><ms>m</ms><msub>2</msub></msup></msub>
                    </mfrac>
                </math>
            </p>
        </div>
    `;
}

function renderCalculator(container) {
  container.innerHTML = `
        <h1>BMI Rechner</h1>
        <form id="bmi-form">
            <div>
                <label class="weight" for="weight">Gewicht in kg</label>
                <input type="number" id="weight" required min="40" max="200" step="1">
            </div>
            <div>
                <label class="height" for="height">Grösse in cm</label>
                <input type="number" id="height" required min="120" max="250" step="1">
            </div>
            <input type="submit" value="Berechnen"/>
        </form>
        <div id="result"></div>
    `;

  const form = document.getElementById('bmi-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const weight = parseFloat(document.getElementById('weight').value);
    const height = parseFloat(document.getElementById('height').value);
    const resultDiv = document.getElementById('result');

    if (weight > 0 && height > 0) {
      const bmi = weight / Math.pow(height / 100, 2);
      const rounded = bmi.toFixed(1);

      try {
        const response = await fetch('../../global/resources/categories.json');
        const categories = await response.json();
        const info = findBmiCategory(bmi, categories);

        let output = `Ihr BMI ist: <strong>${rounded}</strong><br>`;
        if (info) {
          output += `Kategorie: <strong>${info.category}</strong>`;
          if (info.subCategory) {
            output += ` (${info.subCategory})`;
          }
        }
        resultDiv.innerHTML = output;
        resultDiv.style.display = 'block';
      } catch (error) {
        console.error("Error fetching categories:", error);
        resultDiv.innerHTML = `Ihr BMI ist: <strong>${rounded}</strong><br>(Kategorien konnten nicht geladen werden)`;
      }
    }
  });
}

function findBmiCategory(bmi, categories) {
  for (const cat of categories) {
    if (cat.subCategories && cat.subCategories.length > 0) {
      for (const sub of cat.subCategories) {
        if ((sub.low === null || bmi >= sub.low) && (sub.high === null || bmi < sub.high)) {
          return {category: cat.name, subCategory: sub.name};
        }
      }
    }
    if ((cat.low === null || bmi >= cat.low) && (cat.high === null || bmi < cat.high)) {
      return {category: cat.name, subCategory: null};
    }
  }
  return null;
}

function renderCategories(container) {
  container.innerHTML = `
        <h1>BMI Kategorien</h1>
        <table>
            <thead>
                <tr>
                    <th rowspan="2">Kategorie allgemein</th>
                    <th rowspan="2">spezifisch</th>
                    <th colspan="2">Werte</th>
                </tr>
                <tr>
                    <th>minimal</th>
                    <th>maximal</th>
                </tr>
            </thead>
            <tbody id="bmi-categories-body">
                <tr><td colspan="4">Laden...</td></tr>
            </tbody>
        </table>
    `;

  fetch('../../global/resources/categories.json')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('bmi-categories-body');
      tbody.innerHTML = '';

      data.forEach(cat => {
        const subs = cat.subCategories || [];
        if (subs.length === 0) {
          const tr = document.createElement('tr');
          tr.innerHTML = `
                        <td>${cat.name}</td>
                        <td></td>
                        <td>${cat.low !== null ? cat.low : ''}</td>
                        <td>${cat.high !== null ? cat.high : ''}</td>
                    `;
          tbody.appendChild(tr);
        } else {
          subs.forEach((sub, index) => {
            const tr = document.createElement('tr');
            let html = '';
            if (index === 0) {
              html += `<td rowspan="${subs.length}">${cat.name}</td>`;
            }
            html += `
                            <td>${sub.name}</td>
                            <td>${sub.low !== null ? parseFloat(sub.low).toFixed(1) : ''}</td>
                            <td>${sub.high !== null ? parseFloat(sub.high).toFixed(1) : ''}</td>
                        `;
            tr.innerHTML = html;
            tbody.appendChild(tr);
          });
        }
      });
    })
    .catch(() => {
      document.getElementById('bmi-categories-body').innerHTML = '<tr><td colspan="4">Fehler beim Laden der Daten.</td></tr>';
    });
}

function renderStatistics(container) {
  container.innerHTML = `
        <h1>BMI-Statistiken</h1>
        <h2 id="stats-date">Laden...</h2>
        <table>
            <thead>
                <tr>
                    <th rowspan="2">Name</th>
                    <th rowspan="2">ISO 3166</th>
                    <th rowspan="2">Flagge</th>
                    <th rowspan="2">Rang</th>
                    <th colspan="3">Durchschnittswerte</th>
                </tr>
                <tr>
                    <th>gesamt</th>
                    <th>männlich</th>
                    <th>weiblich</th>
                </tr>
            </thead>
            <tbody id="bmi-statistics-body">
                <tr><td colspan="7">Laden...</td></tr>
            </tbody>
        </table>
    `;

  fetch('../../global/resources/statistics.json')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('bmi-statistics-body');
      const dateHeader = document.getElementById('stats-date');

      if (data.date) {
        const date = new Date(data.date);
        dateHeader.textContent = `Stand ${date.toLocaleDateString("de-CH", {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })}`;
      }

      tbody.innerHTML = '';

      Object.keys(data.countries).forEach(code => {
        const stats = data.countries[code];
        const tr = document.createElement('tr');

        const flagSrc = `../../global/img/flags/${code.toLowerCase()}.svg`;

        tr.innerHTML = `
                    <td>${stats.country || code}</td> <td>${code}</td>
                    <td><img src="${flagSrc}" alt="${code}" style="height:20px;"></td>
                    <td>${stats.rank !== null ? stats.rank : ''}</td>
                `;

        [stats.both, stats.male, stats.female].forEach(val => {
          const td = document.createElement('td');
          if (val !== null) {
            td.textContent = parseFloat(val).toFixed(1);
            if (val < 25) {
              td.className = 'bmi-normal';
              td.title = 'Normalgewicht';
            } else {
              td.className = 'bmi-overweight';
              td.title = 'Übergewicht';
            }
          }
          tr.appendChild(td);
        });

        tbody.appendChild(tr);
      });
    })
    .catch(err => {
      console.error(err);
      document.getElementById('bmi-statistics-body').innerHTML = '<tr><td colspan="7">Fehler beim Laden der Daten.</td></tr>';
    });
}
