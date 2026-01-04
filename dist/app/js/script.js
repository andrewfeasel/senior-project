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

$query("#input-form").addEventListener("submit", async function(e) {
  e.preventDefault();

  const message = createMessage("test", InputText.value);
  MessageArray.append(message);
  InputText.value = "";
});