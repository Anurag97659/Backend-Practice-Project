const form = document.getElementById('form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newpassword').value;
    const confirmPassword = document.getElementById('confirmpassword').value;

    fetch('http://localhost:8000/api/v1/users/changePassword', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json/file',
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword}),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                alert(data.error);
            } else {
                alert(`your password has been changed from ${oldPassword} to ${newPassword}`);
                window.location.href = '../login/login.html';
            }
        });

});