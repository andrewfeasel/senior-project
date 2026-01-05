const $query = x => document.querySelector(x);

const InputText = $query("#input-form textarea");
const MessageTemplate = $query("#usr-msg");

function createMessage(username, text) {
  const msg = MessageTemplate.cloneNode(true);
  msg.querySelector("header").textContent = username;
  msg.querySelector("main").textContent = text;
  msg.hidden = false;
  return msg;
}

const MessageArray = {
  element: $query("#msg-container"),
  append(msg) {
    this.element.append(msg);
    if(this.element.children.length > 100) {
      this.element.firstElementChild.remove();
    }
  }
}

const inputForm = $query("#input-form");
inputForm.addEventListener("submit", async function(e) {
  e.preventDefault();
  fetch(inputForm.action, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({username: localStorage.getItem("username"), message: InputText.value})
  }).then(() => {
    InputText.value = "";
  });
});

let lastMessageIndex = 0;

setInterval(() => {
  fetch("/chats")
  .then(res => res.json())
  .then(messages => {
    const newMessages = messages.slice(lastMessageIndex);
    for(const {message, hash, username} of newMessages) {
      const recv_message = createMessage(`${hash.toString(16)}-${username}`, message);
      MessageArray.append(recv_message);
    }
    lastMessageIndex = messages.length;
  })
}, 2000);