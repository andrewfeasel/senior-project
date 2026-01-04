const form = document.getElementById("tos-form");
form.onsubmit = e => {
	e.preventDefault();
	localStorage.setItem("tos-accept", "true");
	location.href = "/";
}