const form = document.getElementById('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('phone').value;
    const password = document.getElementById('password').value;
    const fullname = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    // const avatar = document.getElementById('avatar').value;
    // const coverImgae = document.getElementById('coverImgae').value;

    try {
        fetch('http://localhost:8000/api/v1/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password, fullname, email}),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    alert(data.error);
                } else {
                    alert('registred successful');
                    window.location.href = '../login/login.html';
                }
            })
            .catch((error) => {
                // get the databse error
                alert("user or email already exists");
            });
    
    } catch (error) {
        alert(error);
        
    }
});