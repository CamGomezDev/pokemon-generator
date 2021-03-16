const tf = require("@tensorflow/tfjs")
window.tf = tf;

class Generator {
    constructor() {}

    // Loads a model when it first loads the page
    async loadModel() {
        this.longestLength = 12
        this.vocabSize = 28
        this.vocab = {
            " ": 0, ".": 1, "a": 2, "b": 3, "c": 4, "d": 5, "e": 6, "f": 7, "g": 8, "h": 9, "i": 10, "j": 11, "k": 12, "l": 13, "m": 14, "n": 15, "o": 16, "p": 17, "q": 18, "r": 19, "s": 20, "t": 21, "u": 22, "v": 23, "w": 24, "x": 25, "y": 26, "z": 27
        }
        this.vocabInverse = {
            0: " ", 1: ".", 2: "a", 3: "b", 4: "c", 5: "d", 6: "e", 7: "f", 8: "g", 9: "h", 10: "i", 11: "j", 12: "k", 13: "l", 14: "m", 15: "n", 16: "o", 17: "p", 18: "q", 19: "r", 20: "s", 21: "t", 22: "u", 23: "v", 24: "w", 25: "x", 26: "y", 27: "z"
        }
        this.model = await tf.loadLayersModel("/my-model-trained-300.json")
    }

    async createModelAndTrain(dataset, log) {
        this.preprocess(dataset, log) // Creates vocabulary and training sets
        this.createModel(log) // Creates the TFjs model from previous dimensions
        // Trains the model
        return this.model.fit(this.trainX, this.trainY, { 
            batchSize: 64,
            epochs: 301,
            callbacks: [
                new tf.CustomCallback({
                    onEpochEnd: async(epoch, logs) => {
                        log("Epoch " + epoch + "/300 finished")
                        if (epoch % 25 == 0) {
                            // Logs 5 names every 25 epochs of training
                            log("Test name: " + this.predict(""))
                            log("Test name: " + this.predict(""))
                            log("Test name: " + this.predict(""))
                            log("Test name: " + this.predict(""))
                            log("Test name: " + this.predict(""))
                            log("===========================")
                        }
                    }
                })
            ],
            yieldEvery: 5000
        })
    }

    preprocess(dataset, log) {
        let names = dataset.toLowerCase().split("\n")
        let longestName = ""
        // Gets longest name so all other names are smaller
        for (let i = 0; i < names.length; i++) {
            names[i] = names[i] + "."
            if (names[i].split("").length > longestName.split("").length) {
                longestName = names[i]
            }
        }
        log("Longest name: " + longestName)

        // Creates vocabulary of all individual characters found on the dataset
        let uniqueChars = String.prototype.concat(...new Set(names.join(""))).split("").sort()
        this.vocab = {}
        this.vocabInverse = {}
        for (let i = 0; i < uniqueChars.length; i++) {
            const char = uniqueChars[i];
            this.vocab[char] = i
            this.vocabInverse[i] = char
        }
        log("Vocab: " + Object.keys(this.vocab))

        this.vocabSize = Object.keys(this.vocab).length
        this.longestLength = longestName.length - 1

        // Creates arrays of input and output vectors by turning the names into
        // one-hots of size equal to the longest size (filled with zeros in remainder)
        let arrayNamesIn = []
        let arrayNamesOut = []
        names.forEach(name => {
            const wordIn = name.split("").slice(0, name.split("").length - 1)
            const wordOut = name.split("").slice(1, name.split("").length)
            arrayNamesIn.push(this.convertToOneHot(wordIn, this.vocab))
            arrayNamesOut.push(this.convertToOneHot(wordOut, this.vocab))
        });

        log("Number of samples: " + arrayNamesIn.length)

        // Turns arrays into input and output training tensors
        this.trainX = tf.tensor3d(arrayNamesIn)
        this.trainY = tf.tensor3d(arrayNamesOut)
    }

    createModel(log) {
        // The model is just a sequential type with two layers (lstm and dense)
        // for output
        this.model = tf.sequential()
        this.model.add(tf.layers.lstm({
            units: 128,
            inputShape: [this.longestLength, this.vocabSize],
            returnSequences: true
        }))
        this.model.add(tf.layers.dense({ 
            units: this.vocabSize, activation: "softmax" 
        }))

        this.model.compile({ 
            loss: "categoricalCrossentropy",
            optimizer: "adam"
        })
        
        this.model.summary()
    
        log("Printed summary to the console")
    }

    // Samples a full word with the model. wordBeginning can be empty so it's a
    // fully new word, or it can have some characters so it completes it.
    predict(wordBeginning) {
        let newName = wordBeginning.split("")
        let x = tf.zeros([1, this.longestLength, this.vocabSize]) // Creates tensor of zeros of word size
        let xArr = x.arraySync()
        // Fills tensor with one-hots corresponding to the chars in wordBeginning
        for (let i = 0; i < wordBeginning.split("").length; i++) {
            const char = wordBeginning.split("")[i];
            xArr[0][i][this.vocab[char]] = 1
        }
        x = tf.tensor3d(xArr)
        let end = false
        let i = wordBeginning.split("").length

        // Iterates to sample each new character in the new name
        while (!end) {
            let newCharacter
            if (i == this.longestLength) {
                // If it's too long, finish it with a period.
                newCharacter = "."
                newName.push(newCharacter)
                end = true
            } else {
                // Predicts new char from all the previous ones
                let probs = this.model.predict(x).arraySync()[0][i]
                let probsSum = 0
                probs.forEach(prob => {
                    probsSum += prob
                });
                for (let i = 0; i < probs.length; i++) {
                    probs[i] = probs[i] / probsSum;
                }

                let charId = randomChoices(probs, 1)[0]
                newCharacter = this.vocabInverse[charId]
                newName.push(newCharacter)
                let xArr = x.arraySync()
                xArr[0][i][charId] = 1
                x = tf.tensor3d(xArr)

                if (newCharacter == ".") {
                    end = true
                }

                i += 1
            }
        }

        return newName.join("")
    }

    convertToOneHot(word, vocab) {
        let encodedWord = []
        // Convert to one-hot all the chars in the word
        word.forEach(char => {
            let charOneHot = []
            for (let i = 0; i < Object.keys(vocab).length; i++) {
                if (vocab[char] == i) {
                    charOneHot.push(1)
                } else {
                    charOneHot.push(0)
                }                
            }
            encodedWord.push(charOneHot)
        });

        // And convert to array of zeros all the remaining for longestLenth
        for (let i = word.length; i < this.longestLength; i++) {
            let charOneHot = []
            for (let i = 0; i < Object.keys(vocab).length; i++) {
                charOneHot.push(0)
            }
            encodedWord.push(charOneHot)
        }

        return encodedWord
    }
}

function randomChoice(p) {
    let rnd = p.reduce( (a, b) => a + b ) * Math.random();
    return p.findIndex( a => (rnd -= a) < 0 );
}

function randomChoices(p, count) {
    return Array.from(Array(count), randomChoice.bind(null, p));
}

export default Generator