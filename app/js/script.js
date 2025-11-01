const $query = x => document.querySelector(x);
const $all = x => [...document.querySelectorAll(x)];

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

$query("#input-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  const messageText = this.querySelector("textarea").value;
  const message = createMessage("test", messageText);
  MessageArray.append(message);
});