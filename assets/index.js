
(function() {
  'use strict';

  const resetForm = document.getElementById('grid-reset-form');
  const grid = document.getElementById('grid');

  // sets up grid based on column/row input
  const gridSetup = function(numX, numY) {
    for (let i = 0; i < numY.value; i++) {
      const newRow = document.createElement('div');

      newRow.className = 'grid-row';

      for (let i = 0; i < numX.value; i++) {
        const newCell = document.createElement('div');

        if (numX.value > 30) {
          newCell.className = 'small-cell ';
        }

        newCell.className += 'cellbase top-layer';
        newRow.appendChild(newCell);
      }
      grid.appendChild(newRow);
    }
  };

  resetForm.addEventListener('submit', () => {
    event.preventDefault();

    const formY = document.getElementById('grid-y');
    const formX = document.getElementById('grid-x');

    while (grid.children.length) {
      grid.removeChild(grid.firstElementChild);
    }

    gridSetup(formX, formY);
    formX.value = '';
    formY.value = '';
  });

  const palette = document.getElementById('palette');
  let currentColor;

  //  custom color
  let customColor;
  const colorInput = document.getElementById('color-input');

  colorInput.addEventListener('change', () => {
    const currentBox = document.getElementById('current-color-box');

    customColor = colorInput.value;
    currentColor = 'custom-color';
    currentBox.setAttribute('style', `background:${customColor}`);
    currentBox.className = currentColor;
  });

  // pick color, save as ext. variable
  palette.addEventListener('click', () => {
    if (event.target === palette) {
      return;
    }

    currentColor = event.target.classList[1];
    document.getElementById('current-color-box').removeAttribute('style');
    document.getElementById('current-color-box').className = currentColor;
  });

  const undo = function(target) {
    if (target.className.includes('cellbase')) {
      return;
    }
    target.parentElement.classList.toggle('top-layer');
    target.parentElement.removeChild(target);
  };

  const addLayer = function(cell, event) {
    const target = event.target;

    cell.className = 'color-layer '.concat(currentColor);

    if (event.altKey) {
      cell.classList.toggle('blend-mode');
    }

    cell.classList.toggle('top-layer');
    target.classList.toggle('top-layer');

    // by this point, class list of new color layer should be:
    // color-layer, (currentColor), (optional blend-mode), top-layer.
    // the parent element (target) should have lost the top-layer class.

    if (cell.className.includes('custom-color')) {
      cell.setAttribute('style', `background:${customColor}`);
    }

    event.target.appendChild(cell);
  };

  // appends/removes a layer of color
  const applyLayerChange = function() {
    // GC: will only apply to the top-most layer of each cell & exclude
    if (!event.target.className.includes('top-layer')) {
      return;
    }

    // GC: will not add any color layers before choosing a color
    if (typeof currentColor === 'undefined') {
      return;
    }

    // enable 'undo' by deleting top-most layer;
    // reassign class to parent after deletion
    if (event.shiftKey) {
      undo(event.target);

      return;
    }

    const newCell = document.createElement('div');

    addLayer(newCell, event);
  };

  // click to draw
  grid.addEventListener('click', () => {
    if (event.target === grid || event.target.className.includes('grid-row')) {
      return;
    }
    applyLayerChange();
  });

  // drag to draw w/mouseenter
  let mouseIsDown = false;
  let topLayerArr = [...document.getElementsByClassName('top-layer')];
  const reinitializeEnterArr = function() {
    for (const cell of topLayerArr) {
      cell.addEventListener('mouseenter', () => {
        if (mouseIsDown) {
          applyLayerChange();
        }
      });
    }
  };

  reinitializeEnterArr();

  //  boolean for whether mouse is up/down
  grid.addEventListener('mousedown', () => {
    mouseIsDown = true;
  });

  document.addEventListener('mouseup', () => {
    mouseIsDown = false;

    // with "top-layer" changing constantly, this part redefines
    // the target elements to apply mouseenter listeners
    // for the newly added layers at each mouseup
    topLayerArr = [...document.getElementsByClassName('top-layer')];
    reinitializeEnterArr();
  });

  //  cursor;
  const brush = document.getElementById('brush');

  grid.addEventListener('mousemove', () => {
    if (event.shiftKey) {
      brush.className = 'transparent';
    } else {
      brush.className = currentColor;
    }

    if (currentColor === 'custom-color') {
      brush.setAttribute('style',
      'display:block'.concat(` left:${event.x}px;`,
        ` left:${event.x}px;`,
        ` top:${event.y}px;`,
        ` background:${customColor}`)
      );
    } else {
      brush.setAttribute('style',
      `display:block; left:${event.x}px; top:${event.y}px`);
    }

    if (event.altKey) {
      brush.className += ' blend-mode';
    }

    if (typeof currentColor !== 'undefined') {
      grid.setAttribute('style', 'cursor:none');
    }
  });

  // above styles are only applied while the cursor is above the grid element;
  // once it leaves the field it is deleted and hidden
  grid.addEventListener('mouseleave', () => {
    brush.removeAttribute('style');
  });

  // grid toggle
  const gridToggle = document.getElementById('grid-toggle');

  gridToggle.addEventListener('click', () => {
    if (event.target.checked === false) {
      for (const cell of [...document.getElementsByClassName('cellbase')]) {
        cell.className = 'cellbase-gridless '.concat(cell.className);
      }
    } else {
      for (const cell of [...document.getElementsByClassName('cellbase')]) {
        cell.classList.toggle('cellbase-gridless');
      }
    }
  });
})();
