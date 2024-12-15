const logout = document.getElementById('logout');

logout.addEventListener('click', (e) => {
    e.preventDefault();
    fetch('http://localhost:8000/api/v1/users/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert('Logout successful');
                window.location.href = '../login/login.html';
            }
        });
});