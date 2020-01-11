"use strict";

// Variables and functions connected with general logic
const model = {
  selectedField: undefined,
  firstPlayerTurn: true,
  whiteCheckers: 12,
  whiteKings: 0,
  redCheckers: 12,
  redKings: 0,
  fieldConquerStartNumber: [],
  fieldConquerStartNumberKing: [],
  fieldConquerMiddleNumber: [],
  fieldConquerMiddleNumberKing: [],
  fieldConquerEndNumber: [],
  fieldConquerEndNumberKing: [],
  isSecondIteration: false,
  selectedToSecondIteration: undefined,
  selectedKingForSecondConquer: undefined,
  isConquering: false,
  clickedMainMenu: false,
  clickedLoadGame: false,
  // r: red, w: white, rk:red king, wk: white king
  board: [
    ["", "r", "", "r", "", "r", "", "r"],
    ["r", "", "r", "", "r", "", "r", ""],
    ["", "r", "", "r", "", "r", "", "r"],
    ["", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", ""],
    ["w", "", "w", "", "w", "", "w", ""],
    ["", "w", "", "w", "", "w", "", "w"],
    ["w", "", "w", "", "w", "", "w", ""]
  ],
  updateBoard: (startField, endField) => {
    const endFieldId = endField.getAttribute("id");
    const endFieldRow = endFieldId[5];
    const endFieldCol = endFieldId[6];
    const startFieldId = startField.getAttribute("id");
    const startFieldRow = startFieldId[5];
    const startFieldCol = startFieldId[6];
    const colorOfChecker = model.board[startFieldRow][startFieldCol];
    model.board[startFieldRow][startFieldCol] = "";
    model.board[endFieldRow][endFieldCol] = colorOfChecker;
  },
  canMakeMove: field => {
    try {
      const fieldId = field.getAttribute("id");
      const fieldRow = fieldId[5];
      const fieldCol = fieldId[6];
      const colorOfChecker = model.board[fieldRow][fieldCol];
      if (
        (model.firstPlayerTurn &&
          (colorOfChecker === "r" || colorOfChecker === "rk")) ||
        (!model.firstPlayerTurn &&
          (colorOfChecker === "w" || colorOfChecker === "wk"))
      ) {
        return false;
      }
      if (model.selectedField && !field.hasChildNodes()) {
        const selectedFieldRow = model.selectedField.id[5];
        const selectedFieldCol = model.selectedField.id[6];
        if (
          model.board[selectedFieldRow][selectedFieldCol] === "w" ||
          model.board[selectedFieldRow][selectedFieldCol] === "r"
        ) {
          var possibleFieldsNumbers = model.possibleFields(model.selectedField);
        } else {
          var possibleFieldsNumbers = model.possibleFieldsKing(
            model.selectedField
          );
        }
        //Checks if there are any free fields
        let fieldsChecked = 0;
        for (let number of possibleFieldsNumbers) {
          if (number === fieldRow + fieldCol) {
            fieldsChecked++;
          }
        }
        if (fieldsChecked === 0) {
          return false;
        }
      }
      return true;
    } catch (error) {}
  },
  possibleFields: field => {
    const fieldId = field.getAttribute("id");
    const possibleFieldsNumbers = [];
    const fieldRow = parseInt(fieldId[5]);
    const fieldCol = parseInt(fieldId[6]);
    if (model.board[fieldRow][fieldCol] !== "") {
      if (model.firstPlayerTurn) {
        if (
          typeof model.board[fieldRow - 1] !== "undefined" &&
          model.board[fieldRow - 1][fieldCol - 1] === ""
        ) {
          possibleFieldsNumbers.push(`${fieldRow - 1}${fieldCol - 1}`);
        }
        if (
          typeof model.board[fieldRow - 1] !== "undefined" &&
          model.board[fieldRow - 1][fieldCol + 1] === ""
        ) {
          possibleFieldsNumbers.push(`${fieldRow - 1}${fieldCol + 1}`);
        }
      } else {
        if (
          typeof model.board[fieldRow + 1] !== "undefined" &&
          model.board[fieldRow + 1][fieldCol - 1] === ""
        ) {
          possibleFieldsNumbers.push(`${fieldRow + 1}${fieldCol - 1}`);
        }
        if (
          typeof model.board[fieldRow + 1] !== "undefined" &&
          model.board[fieldRow + 1][fieldCol + 1] === ""
        ) {
          possibleFieldsNumbers.push(`${fieldRow + 1}${fieldCol + 1}`);
        }
      }
    }
    return possibleFieldsNumbers;
  },
  possibleFieldsKing: field => {
    const fieldId = field.getAttribute("id");
    const possibleFieldsNumbers = [];
    const fieldRow = parseInt(fieldId[5]);
    const fieldCol = parseInt(fieldId[6]);
    for (let i = 1; i < 7; i++) {
      if (
        fieldRow - i >= 0 &&
        fieldCol - i >= 0 &&
        model.board[fieldRow - i][fieldCol - i] === ""
      ) {
        possibleFieldsNumbers.push(`${fieldRow - i}${fieldCol - i}`);
      } else {
        break;
      }
    }
    for (let i = 1; i < 7; i++) {
      if (
        fieldRow - i >= 0 &&
        fieldCol + i <= 7 &&
        model.board[fieldRow - i][fieldCol + i] === ""
      ) {
        possibleFieldsNumbers.push(`${fieldRow - i}${fieldCol + i}`);
      } else {
        break;
      }
    }
    for (let i = 1; i < 7; i++) {
      if (
        fieldRow + i <= 7 &&
        fieldCol - i >= 0 &&
        model.board[fieldRow + i][fieldCol - i] === ""
      ) {
        possibleFieldsNumbers.push(`${fieldRow + i}${fieldCol - i}`);
      } else {
        break;
      }
    }
    for (let i = 1; i < 7; i++) {
      if (
        fieldRow + i <= 7 &&
        fieldCol + i <= 7 &&
        model.board[fieldRow + i][fieldCol + i] === ""
      ) {
        possibleFieldsNumbers.push(`${fieldRow + i}${fieldCol + i}`);
      } else {
        break;
      }
    }
    return possibleFieldsNumbers;
  },
  canConquer: () => {
    if (!model.isConquering) {
      if (model.firstPlayerTurn) {
        var currentChecker = "w";
        var oppChecker = "r";
        var oppKing = "rk";
      } else {
        var currentChecker = "r";
        var oppChecker = "w";
        var oppKing = "wk";
      }
      let secondConquerIndicator = [];
      function boardChecker(row, col, iteration = 1) {
        row = parseInt(row);
        col = parseInt(col);
        const middleRows = [row - 1, row + 1];
        const middleCols = [col - 1, col + 1];
        const endRows = [row - 2, row + 2];
        const endCols = [col - 2, col + 2];
        const indicatorLenght = secondConquerIndicator.length;
        for (let i = 0; i < 2; i++) {
          for (let j = 0; j < 2; j++) {
            if (
              typeof model.board[middleRows[i]] !== "undefined" &&
              typeof model.board[endRows[i]] !== "undefined"
            ) {
              if (
                (model.board[middleRows[i]][middleCols[j]] === oppChecker ||
                  model.board[middleRows[i]][middleCols[j]] === oppKing) &&
                model.board[endRows[i]][endCols[j]] === ""
              ) {
                if (iteration === 1) {
                  model.fieldConquerStartNumber.push(
                    row.toString() + col.toString()
                  );
                  model.fieldConquerMiddleNumber.push(
                    middleRows[i].toString() + middleCols[j].toString()
                  );
                  model.fieldConquerEndNumber.push(
                    endRows[i].toString() + endCols[j].toString()
                  );
                  model.isConquering = true;
                } else if (iteration > 1) {
                  secondConquerIndicator.push(1);
                }
              }
            }
          }
        }
        if (iteration > 1) {
          if (indicatorLenght - secondConquerIndicator.length >= 0) {
            secondConquerIndicator.push(0);
          }
        }
      }
      for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
          if (
            model.board[i][j] === currentChecker &&
            !model.isSecondIteration
          ) {
            boardChecker(i, j);
          } else if (
            model.board[i][j] === currentChecker &&
            model.isSecondIteration
          ) {
            if (
              i.toString() + j.toString() ===
              model.selectedToSecondIteration
            ) {
              boardChecker(i, j);
            }
          }
        }
      }
      for (let i = 0; i < model.fieldConquerEndNumber.length; i++) {
        boardChecker(
          model.fieldConquerEndNumber[i][0],
          model.fieldConquerEndNumber[i][1],
          2
        );
      }
      if (secondConquerIndicator.length > 0) {
        const maximum = Math.max.apply(Math, secondConquerIndicator);
        for (let i = 0; i < secondConquerIndicator.length; i++) {
          if (secondConquerIndicator[i] < maximum) {
            model.fieldConquerStartNumber.splice(i, 1);
            model.fieldConquerMiddleNumber.splice(i, 1);
            model.fieldConquerEndNumber.splice(i, 1);
            secondConquerIndicator.splice(i, 1);
            i--;
          }
        }
        if (secondConquerIndicator[0] === 1) {
          model.isSecondIteration = true;
        }
      }
    }

    return model.fieldConquerEndNumber.length > 0 ? true : false;
  },
  //This is called ugly code asf but i didnt have any idea how can I do this without repition. It is responsible for conquering with king
  canConquerKing: () => {
    if (!model.isConquering) {
      if (model.firstPlayerTurn) {
        var currentKing = "wk";
        var oppKing = "rk";
        var oppChecker = "r";
      } else {
        var currentKing = "rk";
        var oppKing = "wk";
        var oppChecker = "w";
      }
      const directions = [];
      for (let k = 0; k < 8; k++) {
        for (let l = 0; l < 8; l++) {
          if (model.board[k][l] === currentKing) {
            const field = document.getElementById(`field${k}${l}`);
            const fieldId = field.id;
            const row = parseInt(fieldId[5]);
            const col = parseInt(fieldId[6]);
            const boardValues = [];
            for (let i = 1; i < 7; i++) {
              if (row - i >= 0 && col - i >= 0) {
                boardValues.push(model.board[row - i][col - i]);
              } else {
                boardValues.push("xx");
              }
              if (row - i >= 0 && col + i <= 7) {
                boardValues.push(model.board[row - i][col + i]);
              } else {
                boardValues.push("xx");
              }
              if (row + i <= 7 && col - i >= 0) {
                boardValues.push(model.board[row + i][col - i]);
              } else {
                boardValues.push("xx");
              }
              if (row + i <= 7 && col + i <= 7) {
                boardValues.push(model.board[row + i][col + i]);
              } else {
                boardValues.push("xx");
              }
            }
            function pushToArrays(direction, rowMiddle, colMiddle) {
              directions.push(direction);
              model.fieldConquerMiddleNumberKing.push(
                `${rowMiddle}${colMiddle}`
              );
              model.fieldConquerStartNumberKing.push(`${row}${col}`);
              model.fieldConquerEndNumberKing.push([]);
            }
            const possibleDirections = ["lu", "ru", "ld", "rd"];
            const firtSign = ["-", "-", "+", "+"];
            const secondSign = ["-", "+", "-", "+"];
            for (let i = 0; i < 4; i++) {
              if (
                (boardValues[0 + i] === oppKing ||
                  boardValues[0 + i] === oppChecker) &&
                boardValues[4 + i] === ""
              ) {
                pushToArrays(
                  possibleDirections[i],
                  eval(`row${firtSign[i]}1`),
                  eval(`col${secondSign[i]}1`)
                );
              } else if (
                boardValues[0 + i] === "" &&
                (boardValues[4 + i] === oppKing ||
                  boardValues[4 + i] === oppChecker) &&
                boardValues[8 + i] === ""
              ) {
                pushToArrays(
                  possibleDirections[i],
                  eval(`row${firtSign[i]}2`),
                  eval(`col${secondSign[i]}2`)
                );
              } else if (
                boardValues[0 + i] === "" &&
                boardValues[4 + i] === "" &&
                (boardValues[8 + i] === oppKing ||
                  boardValues[8 + i] === oppChecker) &&
                boardValues[12 + i] === ""
              ) {
                pushToArrays(
                  possibleDirections[i],
                  eval(`row${firtSign[i]}3`),
                  eval(`col${secondSign[i]}3`)
                );
              } else if (
                boardValues[0 + i] === "" &&
                boardValues[4 + i] === "" &&
                boardValues[8 + i] === "" &&
                (boardValues[12 + i] === oppKing ||
                  boardValues[12 + i] === oppChecker) &&
                boardValues[16 + i] === ""
              ) {
                pushToArrays(
                  possibleDirections[i],
                  eval(`row${firtSign[i]}4`),
                  eval(`col${secondSign[i]}4`)
                );
              } else if (
                boardValues[0 + i] === "" &&
                boardValues[4 + i] === "" &&
                boardValues[8 + i] === "" &&
                boardValues[12 + i] === "" &&
                (boardValues[16 + i] === oppKing ||
                  boardValues[16 + i] === oppChecker) &&
                boardValues[20 + i] === ""
              ) {
                pushToArrays(
                  possibleDirections[i],
                  eval(`row${firtSign[i]}5`),
                  eval(`col${secondSign[i]}5`)
                );
              }
            }
          }
        }
      }
      if (typeof model.selectedKingForSecondConquer !== "undefined") {
        if (model.fieldConquerMiddleNumberKing.length > 0) {
          for (let i = 0; i < model.fieldConquerStartNumberKing.length; i++) {
            if (
              model.fieldConquerStartNumberKing[i] !==
              model.selectedKingForSecondConquer
            ) {
              model.fieldConquerStartNumberKing.splice(i, 1);
              model.fieldConquerMiddleNumberKing.splice(i, 1);
              model.fieldConquerEndNumberKing.splice(i, 1);
              directions.splice(i, 1);
              i--;
            }
          }
        }
      }
      if (model.fieldConquerMiddleNumberKing.length > 0) {
        for (let i = 0; i < model.fieldConquerEndNumberKing.length; i++) {
          const middleRow = parseInt(model.fieldConquerMiddleNumberKing[i][0]);
          const middleCol = parseInt(model.fieldConquerMiddleNumberKing[i][1]);
          if (directions[i] === "lu") {
            for (let j = 1; j < 6; j++) {
              if (
                middleRow - j >= 0 &&
                model.board[middleRow - j][middleCol - j] === ""
              ) {
                model.fieldConquerEndNumberKing[i].push(
                  `${middleRow - j}${middleCol - j}`
                );
              } else {
                break;
              }
            }
          } else if (directions[i] === "ru") {
            for (let j = 1; j < 6; j++) {
              if (
                middleRow - j >= 0 &&
                model.board[middleRow - j][middleCol + j] === ""
              ) {
                model.fieldConquerEndNumberKing[i].push(
                  `${middleRow - j}${middleCol + j}`
                );
              } else {
                break;
              }
            }
          } else if (directions[i] === "ld") {
            for (let j = 1; j < 6; j++) {
              if (
                middleRow + j <= 7 &&
                model.board[middleRow + j][middleCol - j] === ""
              ) {
                model.fieldConquerEndNumberKing[i].push(
                  `${middleRow + j}${middleCol - j}`
                );
              } else {
                break;
              }
            }
          } else if (directions[i] === "rd") {
            for (let j = 1; j < 6; j++) {
              if (
                middleRow + j <= 7 &&
                model.board[middleRow + j][middleCol + j] === ""
              ) {
                model.fieldConquerEndNumberKing[i].push(
                  `${middleRow + j}${middleCol + j}`
                );
              } else {
                break;
              }
            }
          }
        }
      }
      if (model.fieldConquerMiddleNumberKing.length > 0) {
        model.isConquering = true;
      }
    }
    return model.fieldConquerMiddleNumberKing.length > 0 ? true : false;
  },
  resetGame: () => {
    model.board = [
      ["", "r", "", "r", "", "r", "", "r"],
      ["r", "", "r", "", "r", "", "r", ""],
      ["", "r", "", "r", "", "r", "", "r"],
      ["", "", "", "", "", "", "", ""],
      ["", "", "", "", "", "", "", ""],
      ["w", "", "w", "", "w", "", "w", ""],
      ["", "w", "", "w", "", "w", "", "w"],
      ["w", "", "w", "", "w", "", "w", ""]
    ];
    model.selectedField = undefined;
    model.firstPlayerTurn = true;
    model.whiteCheckers = 12;
    model.whiteKings = 0;
    model.redCheckers = 12;
    model.redKings = 0;
    model.fieldConquerStartNumber = [];
    model.fieldConquerStartNumberKing = [];
    model.fieldConquerMiddleNumber = [];
    model.fieldConquerMiddleNumberKing = [];
    model.fieldConquerEndNumber = [];
    model.fieldConquerEndNumberKing = [];
    model.isSecondIteration = false;
    model.selectedToSecondIteration = undefined;
    model.selectedKingForSecondConquer = undefined;
    model.isConquering = false;
    view.updateScore();
    view.switchTurnIndicators();
  },
  saveGame: () => {
    const savedGame = {
      board: model.board,
      selectedField: model.selectedField,
      firstPlayerTurn: model.firstPlayerTurn,
      whiteCheckers: model.whiteCheckers,
      whiteKings: model.whiteKings,
      redCheckers: model.redCheckers,
      redKings: model.redKings,
      fieldConquerStartNumber: model.fieldConquerStartNumber,
      fieldConquerStartNumberKing: model.fieldConquerStartNumberKing,
      fieldConquerMiddleNumber: model.fieldConquerMiddleNumber,
      fieldConquerMiddleNumberKing: model.fieldConquerMiddleNumberKing,
      fieldConquerEndNumber: model.fieldConquerEndNumber,
      fieldConquerEndNumberKing: model.fieldConquerEndNumberKing,
      isSecondIteration: model.isSecondIteration,
      selectedToSecondIteration: model.selectedToSecondIteration,
      selectedKingForSecondConquer: model.selectedKingForSecondConquer,
      isConquering: model.isConquering
    };
    localStorage.setItem("savedGame", JSON.stringify(savedGame));
  }
};

// Variables and functions for logic connected with view and display
const view = {
  drawBoard: () => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const field = document.createElement("div");
        field.id = `field${i}${j}`;
        field.classList.add("field");
        if (i % 2 === 0 && j % 2 === 0) {
          field.classList.add("light-field");
        } else if (i % 2 !== 0 && j % 2 !== 0) {
          field.classList.add("light-field");
        } else {
          field.classList.add("dark-field");
          if (model.board[i][j] !== "") {
            const checker = document.createElement("img");
            checker.id = `checker${i}${j}`;
            checker.classList.add("checker");
            const boardField = model.board[i][j];
            if (boardField === "r") {
              checker.src = "red.png";
            } else if (boardField === "rk") {
              checker.src = "redking.png";
            } else if (boardField === "w") {
              checker.src = "white.png";
            } else if (boardField === "wk") {
              checker.src = "whiteking.png";
            }
            field.appendChild(checker);
          }
        }
        document.querySelector("#board").appendChild(field);
      }
    }
    document.querySelectorAll(".field").forEach(field => {
      field.addEventListener("click", () => {
        if (!model.twoPlayerMode || (model.twoPlayerMode && model.playerTurn)) {
          if (!model.isConquering) {
            controller.makeMove(field);
          } else {
            controller.makeConquer(field);
          }
        }
      });
    });
  },
  fadeIn: id => {
    const el = document.getElementById(id);
    el.style.opacity = "0";
    el.style.display = "block";
    // It doesnt work when timeout is not set
    setTimeout(() => {
      el.style.opacity = "1";
    }, 0);
  },
  fadeOut: id => {
    const el = document.getElementById(id);
    el.style.opacity = "0";
    setTimeout(() => {
      el.style.display = "none";
    }, 300);
  },
  // Toggles between two elements
  fadeToggle: (id1, id2) => {
    view.fadeOut(id1);
    setTimeout(() => {
      view.fadeIn(id2);
    }, 400);
  },
  animate: (startField, endField, isconquering = false) => {
    const endFieldId = endField.getAttribute("id");
    const endFieldRow = endFieldId[5];
    const endFieldCol = endFieldId[6];
    const startFieldId = startField.getAttribute("id");
    const startFieldRow = startFieldId[5];
    const startFieldCol = startFieldId[6];
    const fieldSize = endField.offsetWidth;
    let moveRange = startFieldRow - endFieldRow;
    moveRange > 0 ? (moveRange = moveRange) : (moveRange = -moveRange);
    const shiftValue = moveRange * fieldSize;
    let shiftTop;
    let shiftLeft;
    if (startFieldRow > endFieldRow) {
      shiftTop = -shiftValue;
    } else {
      shiftTop = shiftValue;
    }
    if (startFieldCol > endFieldCol) {
      shiftLeft = -shiftValue;
    } else {
      shiftLeft = shiftValue;
    }
    const checker = startField.firstChild;
    checker.style.top = `${shiftTop}px`;
    checker.style.left = `${shiftLeft}px`;
    // if animated checker is conquering then it gets bigger and then smaller
    if (isconquering) {
      checker.style.transitionTimingFunction = "linear";
      checker.style.width = "130%";
      setTimeout(() => {
        checker.style.width = "100%";
      }, 250);
    }
    setTimeout(() => {
      if (!isconquering) {
        checker.style.transitionTimingFunction = "ease";
      }
      checker.style.top = "0";
      checker.style.left = "0";
      if (startField.hasChildNodes()) {
        startField.removeChild(checker);
        endField.appendChild(checker);
      }
    }, 500);
  },
  indicatePossibleFields: field => {
    try {
      if (!model.twoPlayerMode) {
        if (!model.isConquering) {
          let possibleFieldsNumbers;
          const fieldId = field.getAttribute("id");
          const fieldRow = fieldId[5];
          const fieldCol = fieldId[6];
          if (
            model.board[fieldRow][fieldCol] === "w" ||
            model.board[fieldRow][fieldCol] === "r"
          ) {
            possibleFieldsNumbers = model.possibleFields(field);
          } else {
            possibleFieldsNumbers = model.possibleFieldsKing(field);
          }
          document.querySelectorAll(".dark-field").forEach(field => {
            field.style.background = "url('wood_1.png')";
          });
          for (let number of possibleFieldsNumbers) {
            document.getElementById(`field${number}`).style.background =
              "rgb(0, 185, 0)";
          }
          field.style.background = "rgb(185, 0, 0)";
        } else {
          document.querySelectorAll(".dark-field").forEach(field => {
            field.style.background = "url('wood_1.png')";
          });
          for (let i = 0; i < model.fieldConquerStartNumber.length; i++) {
            if (
              model.fieldConquerStartNumber[i] !== "xx" &&
              typeof model.selectedKingForSecondConquer === "undefined"
            ) {
              {
                document.getElementById(
                  `field${model.fieldConquerStartNumber[i]}`
                ).style.background = "rgb(185, 0, 0)";
                if (typeof model.fieldConquerEndNumber[i] !== "undefined") {
                  document.getElementById(
                    `field${model.fieldConquerEndNumber[i]}`
                  ).style.background = "rgb(0, 185, 0)";
                }
              }
            }
          }
          for (let i = 0; i < model.fieldConquerStartNumberKing.length; i++) {
            if (typeof model.fieldConquerEndNumberKing[i] !== "undefined") {
              document.getElementById(
                `field${model.fieldConquerStartNumberKing[i]}`
              ).style.background = "rgb(185, 0, 0)";
              for (
                let j = 0;
                j < model.fieldConquerEndNumberKing[i].length;
                j++
              ) {
                document.getElementById(
                  `field${model.fieldConquerEndNumberKing[i][j]}`
                ).style.background = "rgb(0, 185, 0)";
              }
            }
          }
        }
      }
    } catch (error) {}
  },
  switchTurnIndicators: () => {
    if (model.firstPlayerTurn) {
      document.getElementById("red-turn-indicator").style.background = "black";
      document.getElementById("white-turn-indicator").style.background =
        "rgb(0, 185, 0)";
    } else {
      document.getElementById("red-turn-indicator").style.background =
        "rgb(0, 185, 0)";
      document.getElementById("white-turn-indicator").style.background =
        "black";
    }
  },
  updateScore: () => {
    document.getElementById("white-checkers").innerHTML = model.whiteCheckers;
    document.getElementById("white-kings").innerHTML = model.whiteKings;
    document.getElementById("red-checkers").innerHTML = model.redCheckers;
    document.getElementById("red-kings").innerHTML = model.redKings;
  },
  drawCheckers: () => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const field = document.getElementById(`field${i}${j}`);
        while (field.firstChild) {
          field.removeChild(field.firstChild);
        }
        if (model.board[i][j] !== "") {
          const checker = document.createElement("img");
          checker.id = `checker${i}${j}`;
          checker.classList.add("checker");
          const boardField = model.board[i][j];
          if (boardField === "r") {
            checker.src = "red.png";
          } else if (boardField === "rk") {
            checker.src = "redking.png";
          } else if (boardField === "w") {
            checker.src = "white.png";
          } else if (boardField === "wk") {
            checker.src = "whiteking.png";
          }
          field.appendChild(checker);
        }
      }
    }
  }
};

// Variables and methods for logic connected with parsing data from user, reacting for user actions and managing model and view
const controller = {
  makeMove: field => {
    if (model.canMakeMove(field)) {
      if (typeof model.selectedField === "undefined" && field.hasChildNodes()) {
        view.indicatePossibleFields(field);
        model.selectedField = field;
      } else if (typeof model.selectedField !== "undefined") {
        if (!field.hasChildNodes()) {
          model.updateBoard(model.selectedField, field);
          view.animate(model.selectedField, field);
          document.querySelectorAll(".dark-field").forEach(field => {
            field.style.background = "url('wood_1.png')";
          });
          model.selectedField = undefined;
          model.firstPlayerTurn
            ? (model.firstPlayerTurn = false)
            : (model.firstPlayerTurn = true);
          view.switchTurnIndicators();
          controller.makeConquer();
          controller.turnToKing();
        } else {
          view.indicatePossibleFields(field);
          model.selectedField = field;
        }
      }
    }
  },
  makeConquer: field => {
    function resetArrays() {
      model.fieldConquerStartNumber = [];
      model.fieldConquerMiddleNumber = [];
      model.fieldConquerEndNumber = [];
      model.fieldConquerStartNumberKing = [];
      model.fieldConquerMiddleNumberKing = [];
      model.fieldConquerEndNumberKing = [];
      model.isConquering = false;
    }
    let isConquerKing;
    model.canConquerKing();
    if (model.isConquering === true) {
      isConquerKing = true;
      model.isConquering = false;
    } else {
      isConquerKing = false;
    }
    model.canConquer();
    if (model.isConquering === false && isConquerKing === true) {
      model.isConquering = true;
    }
    if (model.isConquering) {
      if (typeof model.selectedField === "undefined") {
        model.selectedField = model.fieldConquerStartNumber;
        setTimeout(() => {
          view.indicatePossibleFields();
        }, 1000);
      } else {
        const fieldId = field.getAttribute("id");
        const fieldRow = fieldId[5];
        const fieldCol = fieldId[6];
        for (let i = 0; i < model.fieldConquerEndNumber.length; i++) {
          if (
            model.fieldConquerEndNumber[i] === fieldRow + fieldCol &&
            typeof model.selectedKingForSecondConquer === "undefined"
          ) {
            const startField = document.getElementById(
              `field${model.fieldConquerStartNumber[i]}`
            );
            const endField = document.getElementById(
              `field${model.fieldConquerEndNumber[i]}`
            );
            const endFieldNumber = fieldRow + fieldCol;
            if (model.isSecondIteration) {
              model.selectedToSecondIteration = endFieldNumber;
            }
            view.animate(startField, endField, true);
            document.querySelectorAll(".dark-field").forEach(field => {
              field.style.background = "url('wood_1.png')";
            });
            const field = document.getElementById(
              `field${model.fieldConquerMiddleNumber[i]}`
            );
            setTimeout(() => {
              while (field.firstChild) {
                field.removeChild(field.firstChild);
              }
            }, 200);
            const boardRowToDelete = model.fieldConquerMiddleNumber[i][0];
            const boardColToDelete = model.fieldConquerMiddleNumber[i][1];
            if (
              model.board[boardRowToDelete][boardColToDelete] === "wk" ||
              model.board[boardRowToDelete][boardColToDelete] === "rk"
            ) {
              model.firstPlayerTurn ? model.redKings-- : model.whiteKings--;
            } else {
              model.firstPlayerTurn
                ? model.redCheckers--
                : model.whiteCheckers--;
            }
            model.updateBoard(startField, endField);
            model.board[boardRowToDelete][boardColToDelete] = "";
            model.selectedField = undefined;
            resetArrays();
            view.updateScore();
            if (
              !model.canConquer() ||
              (model.canConquer() &&
                !model.fieldConquerStartNumber.includes(endFieldNumber))
            ) {
              model.selectedToSecondIteration = undefined;
              model.isSecondIteration = false;
              controller.turnToKing();
              resetArrays();
              model.firstPlayerTurn
                ? (model.firstPlayerTurn = false)
                : (model.firstPlayerTurn = true);
              if (
                (model.redCheckers === 0 && model.redKings === 0) ||
                (model.whiteCheckers === 0 && model.whiteKings === 0)
              ) {
                return;
              } else {
                view.switchTurnIndicators();
              }
            }
            controller.makeConquer();
            return;
          }
        }
        if (model.fieldConquerEndNumberKing.length > 0) {
          for (let i = 0; i < model.fieldConquerEndNumberKing.length; i++) {
            for (
              let j = 0;
              j < model.fieldConquerEndNumberKing[i].length;
              j++
            ) {
              if (
                model.fieldConquerEndNumberKing[i][j] ===
                fieldRow + fieldCol
              ) {
                const startField = document.getElementById(
                  `field${model.fieldConquerStartNumberKing[i]}`
                );
                const endField = document.getElementById(
                  `field${model.fieldConquerEndNumberKing[i][j]}`
                );
                const endFieldNumber = fieldRow + fieldCol;
                view.animate(startField, endField, true);
                document.querySelectorAll(".dark-field").forEach(field => {
                  field.style.background = "url('wood_1.png')";
                });
                const field = document.getElementById(
                  `field${model.fieldConquerMiddleNumberKing[i]}`
                );
                setTimeout(() => {
                  while (field.firstChild) {
                    field.removeChild(field.firstChild);
                  }
                }, 200);
                const boardRowToDelete =
                  model.fieldConquerMiddleNumberKing[i][0];
                const boardColToDelete =
                  model.fieldConquerMiddleNumberKing[i][1];
                if (
                  model.board[boardRowToDelete][boardColToDelete] === "wk" ||
                  model.board[boardRowToDelete][boardColToDelete] === "rk"
                ) {
                  model.firstPlayerTurn ? model.redKings-- : model.whiteKings--;
                } else {
                  model.firstPlayerTurn
                    ? model.redCheckers--
                    : model.whiteCheckers--;
                }
                model.updateBoard(startField, endField);
                model.board[boardRowToDelete][boardColToDelete] = "";
                model.selectedField = undefined;
                resetArrays();
                view.updateScore();
                model.selectedKingForSecondConquer = endFieldNumber;
                if (
                  !model.canConquerKing() ||
                  (model.canConquerKing() &&
                    !model.fieldConquerStartNumberKing.includes(endFieldNumber))
                ) {
                  model.selectedKingForSecondConquer = undefined;
                  resetArrays();
                  model.firstPlayerTurn
                    ? (model.firstPlayerTurn = false)
                    : (model.firstPlayerTurn = true);
                  if (
                    (model.redCheckers === 0 && model.redKings === 0) ||
                    (model.whiteCheckers === 0 && model.whiteKings === 0)
                  ) {
                    return;
                  } else {
                    view.switchTurnIndicators();
                  }
                }
                controller.makeConquer();
                return;
              }
            }
          }
        }
      }
    }
  },
  turnToKing: () => {
    for (let i = 0; i < 8; i++) {
      if (model.board[0][i] === "w") {
        model.board[0][i] = "wk";
        setTimeout(() => {
          document.getElementById(`field0${i}`).firstChild.src =
            "whiteking.png";
        }, 600);
        model.whiteKings++;
        model.whiteCheckers--;
      }
      if (model.board[7][i] === "r") {
        model.board[7][i] = "rk";
        setTimeout(() => {
          document.getElementById(`field7${i}`).firstChild.src = "redking.png";
        }, 600);
        model.redKings++;
        model.redCheckers--;
      }
    }
    view.updateScore();
  },
  loadGame: () => {
    model.resetGame();
    const savedGame = JSON.parse(localStorage.getItem("savedGame"));
    model.board = savedGame.board;
    model.selectedField = savedGame.selectedField;
    model.firstPlayerTurn = savedGame.firstPlayerTurn;
    model.whiteCheckers = savedGame.whiteCheckers;
    model.whiteKings = savedGame.whiteKings;
    model.redCheckers = savedGame.redCheckers;
    model.redKings = savedGame.redKings;
    model.fieldConquerStartNumber = savedGame.fieldConquerStartNumber;
    model.fieldConquerStartNumberKing = savedGame.fieldConquerStartNumberKing;
    model.fieldConquerMiddleNumber = savedGame.fieldConquerMiddleNumber;
    model.fieldConquerMiddleNumberKing = savedGame.fieldConquerMiddleNumberKing;
    model.fieldConquerEndNumber = savedGame.fieldConquerEndNumber;
    model.fieldConquerEndNumberKing = savedGame.fieldConquerEndNumberKing;
    model.isSecondIteration = savedGame.isSecondIteration;
    model.selectedToSecondIteration = savedGame.selectedToSecondIteration;
    model.selectedKingForSecondConquer = savedGame.selectedKingForSecondConquer;
    model.isConquering = savedGame.isConquering;
    view.updateScore();
    view.switchTurnIndicators();
    view.drawCheckers();
    view.indicatePossibleFields();
  }
};

document.getElementById("new-game-option").onclick = () => {
  document.getElementById("board").innerHTML = "";
  model.resetGame();
  view.drawBoard();
  view.fadeToggle("main-menu", "main-container");
};

document.getElementById("load-game-option").onclick = () => {
  if (localStorage.getItem("savedGame") !== null) {
    document.getElementById("board").innerHTML = "";
    view.drawBoard();
    view.fadeToggle("main-menu", "main-container");
    controller.loadGame();
  }
};

document.getElementById("menu-button").onclick = () => {
  view.fadeIn("in-game-menu");
};

document.getElementById("resume-game").onclick = () => {
  view.fadeOut("in-game-menu");
};

document.getElementById("load-game").onclick = () => {
  view.fadeToggle("in-game-menu-options", "sure-pop-up");
  model.clickedLoadGame = true;
};

document.getElementById("go-to-main-menu").onclick = () => {
  view.fadeToggle("in-game-menu-options", "sure-pop-up");
  model.clickedMainMenu = true;
};

document.getElementById("sure-yes").onclick = () => {
  if (model.clickedMainMenu) {
    view.fadeToggle("sure-pop-up", "in-game-menu-options");
    view.fadeToggle("main-container", "main-menu");
    view.fadeOut("in-game-menu");
    model.clickedMainMenu = false;
  } else if (model.clickedLoadGame) {
    controller.loadGame();
    view.fadeToggle("sure-pop-up", "in-game-menu-options");
    view.fadeOut("in-game-menu");
    model.clickedLoadGame = false;
  }
};

document.getElementById("sure-no").onclick = () => {
  view.fadeToggle("sure-pop-up", "in-game-menu-options");
  model.clickedMainMenu = false;
  model.clickedLoadGame = false;
};

document.getElementById("save-game").onclick = () => {
  model.saveGame();
};
