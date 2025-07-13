document.addEventListener('DOMContentLoaded', () => {
  const form1 = document.getElementById('testForm2');
  const form2 = document.getElementById('testForm');
  const result = document.getElementById('jsonResult');

  form1.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stock = form1.querySelector('input[name="stock"]').value;
    const like = form1.querySelector('input[name="like"]').checked;
    const url = `/api/stock-prices?stock=${stock}${like ? '&like=true' : ''}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      result.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      result.textContent = 'Error: ' + err.message;
    }
  });

  form2.addEventListener('submit', async (e) => {
    e.preventDefault();
    const stocks = Array.from(form2.querySelectorAll('input[name="stock"]')).map(input => input.value);
    const like = form2.querySelector('input[name="like"]').checked;
    const url = `/api/stock-prices?stock=${stocks[0]}&stock=${stocks[1]}${like ? '&like=true' : ''}`;
    try {
      const response = await fetch(url);
      const data = await response.json();
      result.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      result.textContent = 'Error: ' + err.message;
    }
  });
});