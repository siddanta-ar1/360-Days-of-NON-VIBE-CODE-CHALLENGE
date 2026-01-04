class MyEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, listenerFunction) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listenerFunction);
  }

  emit(eventName, data) {
    const listeners = this.events[eventName];

    if (listeners) {
      listeners.forEach((fn) => fn(data));
    }
  }

  off(eventName, listenerToRemove) {
    const listeners = this.events[eventName];

    if (listeners) {
      this.events[eventName] = listeners.filter(
        (fn) => fn !== listenerToRemove,
      );
    }
  }
}

const youtube = new MyEmitter();

const distinctUser = (title) =>
  console.log(`I will unsubscribe soon: ${title}`);

youtube.on("video-upload", distinctUser);

console.log("--- First Emit ---");
youtube.emit("video-upload", "Video 1");

youtube.off("video-upload", distinctUser);

console.log("--- Second Emit ---");
youtube.emit("video-upload", "Video 2");
