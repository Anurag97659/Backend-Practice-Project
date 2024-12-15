const form = document.getElementById('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('http://localhost:8000/api/v1/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Login successful');
                // document.getElementById('dash').innerHTML=`Welcome to your dashboard ${user}`;
                window.location.href = '../dashboard/dashboard.html';
                
            }
        });

});

