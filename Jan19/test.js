fetch("http://localhost:3000/login", {
  method: "POST",
  body: JSON.stringify({ name: "Siddanta", password: "123" }),
})
  .then((res) => res.json())
  .then(console.log)
  .catch(console.error);
