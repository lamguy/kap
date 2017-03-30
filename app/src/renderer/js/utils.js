const {ipcRenderer} = require('electron');

function isVisible(el) {
  const classList = el.classList;

  return !(classList.contains('invisible') || classList.contains('hidden'));
}

function $(selector) {
  return document.querySelector(selector);
}

function handleTrafficLightsClicks({wrapper = $('.title-bar__controls'), hide = false} = {}) {
  const hideWindowBtn = hide ? wrapper.querySelector('.hide-window') : wrapper.querySelector('.close-window');
  const minimizeWindowBtn = wrapper.querySelector('.minimize-window');

  hideWindowBtn.addEventListener('click', () => {
    if (isVisible(wrapper)) {
      ipcRenderer.send(hide ? 'hide-window' : 'close-window');
    }
  });

  minimizeWindowBtn.addEventListener('click', () => {
    if (isVisible(wrapper)) {
      ipcRenderer.send('minimize-window');
    }
  });
}

function disposeObservers(observers) {
  for (const observer of observers) {
    observer.dispose();
  }
}

function getRelativeLeft({element, parent}) {
  const {left: parentLeft} = parent.getBoundingClientRect();
  const {left: elementLeft} = element.getBoundingClientRect();

  return elementLeft - parentLeft;
}

function moveShimToButton({shim, button}) {
  const left = getRelativeLeft({
    element: button,
    parent: button.parentNode
  });
  shim.style.transform = `translateX(${left}px)`;
}

function setShimBorderRadius({shim, activeButton, buttonGroupArray}) {
  const index = buttonGroupArray.indexOf(activeButton);
  if (index === 0) {
    shim.style.borderRadius = '3px 0 0 3px';
  } else if (index === buttonGroupArray.length - 1) {
    shim.style.borderRadius = '0 3px 3px 0';
  } else {
    shim.style.borderRadius = '';
  }
}

function handleActiveButtonGroup({buttonGroup}) {
  const shim = buttonGroup.querySelector('.active-shim');
  const buttons = Array.from(buttonGroup.querySelectorAll('button'));
  const buttonDimensions = {
    width: buttons[0].offsetWidth,
    height: buttons[0].offsetHeight
  };

  shim.style.width = `${buttonDimensions.width}px`;
  shim.style.height = `${buttonDimensions.height}px`;

  const activeButton = buttons.find(el => el.classList.contains('active'));
  setShimBorderRadius({
    shim,
    buttonGroupArray: buttons,
    activeButton
  });

  buttons.map(button => {
    button.addEventListener('click', () => {
      moveShimToButton({shim, button});

      setShimBorderRadius({
        shim,
        buttonGroupArray: buttons,
        activeButton: button
      });
    });
    return null;
  });
}

export {handleTrafficLightsClicks, isVisible, $, disposeObservers, handleActiveButtonGroup};
