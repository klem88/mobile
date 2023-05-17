
//https://developers.google.com/web/fundamentals/codelabs/push-notifications/

/*
*
*  Push Notifications codelab
*  Copyright 2015 Google Inc. All rights reserved.
*
*  Licensed under the Apache License, Version 2.0 (the "License");
*  you may not use this file except in compliance with the License.
*  You may obtain a copy of the License at
*
*      https://www.apache.org/licenses/LICENSE-2.0
*
*  Unless required by applicable law or agreed to in writing, software
*  distributed under the License is distributed on an "AS IS" BASIS,
*  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*  See the License for the specific language governing permissions and
*  limitations under the License
*
*/

/* eslint-env browser, es6 */

'use strict';

const applicationServerPublicKey = 'BIqGeEniD71rEdz0l4irrUOW72w9suUxPoVgDiip37kUS-I_0br3R_PQWC-qPETpdUQ3UHhhQlqeBc3oDOD4S_U';


const pushButton = document.getElementById('switchnotif');

let isSubscribed = false;
let swRegistration = null;

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

if ('serviceWorker' in navigator/* && 'PushManager' in window*/) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.register('sw.js')
  .then(function(swReg) {
    //swReg.update();
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    //initializeUI();
  })
  .catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  //pushButton.textContent = 'Push Not Supported';
}

function initializeUI() {

  pushButton.addEventListener('change', function() {
    console.log(pushButton.checked);
    //pushButton.disabled = true;
    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }
  });


  // Set the initial subscription value
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    isSubscribed = !(subscription === null);
    console.log(isSubscribed);
    console.log(Notification.permission);
    if (isSubscribed) {
      console.log('User IS subscribed.');
      if (Notification.permission === 'denied') setTimeout(unsubscribeUser, 1000);
    } else {
      console.log('User is NOT subscribed.');
      if (Notification.permission != 'denied') setTimeout(subscribeUser, 1000);
    }

    updateBtn();
  });
}

function updateBtn() {
  if (Notification.permission === 'denied') {
    console.log('Push Messaging Blocked.');
    //pushButton.textContent = 'Push Messaging Blocked.';
    pushButton.disabled = true;
    updateSubscriptionOnServer(null);
    return;
  }

  if (isSubscribed) {
    pushButton.checked = true;
  } else {
    pushButton.checked = false;
  }

  pushButton.disabled = false;
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();
  })
  .catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function updateSubscriptionOnServer(subscription) {
  // TODO: Send subscription to application server

  /*const subscriptionJson = document.querySelector('.js-subscription-json');
  const subscriptionDetails = document.querySelector('.js-subscription-details');*/

  if (subscription) {
    let sub = JSON.parse(JSON.stringify(subscription));
    sendsubscription(sub);

  } else {
    console.log('unsubscription');
    //subscriptionDetails.classList.add('is-invisible');
  }
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription()
  .then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  })
  .catch(function(error) {
    console.log('Error unsubscribing', error);
  })
  .then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

function sendsubscription(subscription){

  let data = {
    'endpoint' : subscription.endpoint,
    'p256dh' : subscription.keys.p256dh,
    'auth' : subscription.keys.auth
  };
  console.log(data);
  $.post("https://dmaster-d25.staging-cyberlibris.com/receivers/pushsubscription.php",
      data,
      function(data, status){
        console.log("Data: " + data + "\nStatus: " + status);
      });
};