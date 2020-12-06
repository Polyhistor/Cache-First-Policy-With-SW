if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceworker.js');

  navigator.serviceWorker.addEventListener('message', (event) => {
    switch (event.data.action && event.data.action) {
      case 'resources-updated':
        alert('The app is ready for an update. Please reload');
        break;
    }
  });
}

const sendMessageToSW = (message) => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
  } else {
    console.log('There is no SW controlling this page');
  }
};

const update = () => {
  sendMessageToSW({
    action: 'update-resouces',
  });
};

function vote(tourId) {
  if ('SyncManager' in window) {
    // We will use Background Sync
    navigator.serviceWorker.getRegistration().then((registration) => {
      registration.sync.register(`vote-${tourId}`);
    });
  } else {
    event.waitUntill(
      fetch(`/vote.json?id=${tourId}`)
        .then((r) => r.json())
        .then((voted) => {
          console.log('voted!');
        })
    );
  }
}
