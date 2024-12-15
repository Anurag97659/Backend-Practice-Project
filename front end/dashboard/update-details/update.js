const form = document.getElementById('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('phone').value;
   
    const email = document.getElementById('email').value;
  
    fetch('http://localhost:8000/api/v1/users/udateDetails', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('updated successful');
                window.location.href = '../login/login.html';
            }
        });

});