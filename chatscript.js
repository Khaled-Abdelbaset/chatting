let username = prompt("Please enter your name");
console.log(username);

let title_h = document.getElementById("title");
title_h.innerHTML = `User ${username}`;

let chatbox = document.getElementById("chatbox");
let msg_input = document.getElementById("msg");
let send_btn = document.getElementById("send");
let clear_btn = document.getElementById("clear_chat");
let online_div = document.getElementById("onlineusers");

let mywebsocket = new WebSocket("ws://localhost:3000");

mywebsocket.onopen = function () {
  console.log("WebSocket connection opened", this);
  let message_obj = {
    username: username,
    login: true,
  };
  this.send(JSON.stringify(message_obj));
};

mywebsocket.onmessage = function (event) {
  console.log("Received message from server:", event.data);
  let msg_content = JSON.parse(event.data);

  if (msg_content.type === "login") {
    chatbox.innerHTML += `<p class="w-auto text-center"><span class="px-3 py-1 text-primary-emphasis bg-info-subtle border border-primary-subtle rounded-3">${msg_content.message}</span></p>`;
  } else if (msg_content.type === "logout") {
    chatbox.innerHTML += `<h3 class="text-center px-3 py-1 text-danger-emphasis bg-info-subtle border border-primary-subtle rounded-3">${msg_content.message}</h3>`;
  } else if (msg_content.type === "chat") {
    let [msg_username, ...msg_parts] = msg_content.message.split(":");
    let msg_text = msg_parts.join(":").trim();

    if (msg_username !== username) {
      chatbox.innerHTML += `<h4 class="w-50 bg-secondary rounded-3 text-wrap text-light px-4 py-2 mx-2">${msg_username}: ${msg_text}</h4>`;
    }
  }

  online_div.innerHTML = "";
  msg_content.online.forEach((element) => {
    if (element && element !== username && element !== "null") {
      online_div.innerHTML += `<li class="list-group-item position-relative"><span class="position-absolute top-50 end-100 translate-middle bg-success p-2 border  border-light rounded-circle"></span>${element}</li>`;
    }
  });
};

mywebsocket.onerror = function (error) {
  console.error("WebSocket error:", error);
  chatbox.innerHTML += '<h3 style="color: red">Error connecting to server</h3>';
};

send_btn.addEventListener("click", function () {
  let msg_val = msg_input.value;
  let message_obj = {
    body: `${username}:${msg_val}`,
  };
  console.log("Sending message:", message_obj);
  mywebsocket.send(JSON.stringify(message_obj));
  chatbox.innerHTML += `<h4 class="ms-auto w-50 bg-primary text-wrap rounded-2 text-light px-4 py-2 mx-2">Me: ${msg_val}</h4>`;
  msg_input.value = "";
});

clear_btn.addEventListener("click", function () {
  chatbox.innerHTML = "";
});
