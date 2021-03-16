<template>
  <div class="hello">
    <div class="container">
      <div class="row d-flex justify-content-center">
        <div class="col-12">
          <h1 style="text-align:center">Pokemon Name Generator</h1>
        </div>
      </div>
      <div class="row mt-4 d-flex justify-content-center">
        <div class="col-8 d-flex justify-content-between">
          <b-button @click="toggleDataset()">
            Dataset
          </b-button>
          <b-button variant="info" @click="createModelAndTrain()">
            Train model again
            <b-icon
              icon="arrow-clockwise" animation="spin" v-if="trainingModel" 
              style="background: transparent"/>
          </b-button>
          <b-button @click="toggleLogs()">
            Logs
          </b-button>
        </div>
      </div>

      <div class="row d-flex justify-content-center">
        <div class="col-8">
          <b-collapse id="collapse-1" style="margin-top: 30px" v-model="datasetOpen">
            <b-card no-body>
              <b-form-textarea
                v-model="dataset"
                id="textarea-small"
                size="sm"
                placeholder="All names"
                class="m-0"
                disabled
              ></b-form-textarea>
            </b-card>
          </b-collapse>
        </div>
      </div>

      <div class="row d-flex justify-content-center">
        <div class="col-8">
          <b-collapse id="collapse-2" style="margin-top: 30px" v-model="logsOpen">
            <b-card no-body>
              <b-form-textarea
                v-model="logs"
                id="textarea-small"
                size="sm"
                placeholder="You currently have a version of the model trained."
                class="m-0"
                disabled
              ></b-form-textarea>
            </b-card>
          </b-collapse>
        </div>
      </div>

      <div class="row d-flex justify-content-center" style="margin-top:40px">
        <div class="col-8">
          <div style="display:flex">
            <input 
              style="flex-grow: 1" type="text" placeholder="First letters (or leave empty)" 
              maxlength="6" onkeypress="return /[a-z]/i.test(event.key)" v-model="input"
              :disabled="trainingModel">
            <b-button 
              style="margin-left: 10px; flex-grow: 0" :disabled="trainingModel"
              @click="predicting = true; modelPredict()">
              Generate
              <b-icon
                icon="arrow-clockwise" animation="spin" v-if="predicting"
                style="background: transparent"/>
            </b-button>
          </div>
          <div style="margin-left: 2px">
            <p 
              v-for="(prediction, index) in predictions" :key="index" 
              style="margin-top: 5px; margin-bottom: 0px">
              {{ prediction }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import Generator from "./learn/model"
import DATASET from "./learn/dataset"

export default {
  data() {
    return {
      dataset: DATASET.join("\n"),
      logs: "",
      input: "",
      predictions: [],
      trainingModel: false,
      predicting: false,
      generator: null,
      predicted: false,
      datasetOpen: false,
      logsOpen: false
    }
  },
  async mounted() {
    this.predicting = true;
    this.generator = new Generator()
    await this.generator.loadModel()
    this.modelPredict()
  },
  methods: {
    createModelAndTrain() {
      this.datasetOpen = false
      this.logsOpen = true
      this.trainingModel = true;
      this.generator.createModelAndTrain(this.dataset, this.log).then(() => {
        this.trainingModel = false
      })
    },
    log(newLog) {
      this.logs = this.logs + newLog + "\n"
    },
    toggleDataset() {
      this.logsOpen = false
      this.datasetOpen = !this.datasetOpen
    },
    toggleLogs() {
      this.datasetOpen = false
      this.logsOpen = !this.logsOpen
    },
    modelPredict() {
      let newPredictions = []
      newPredictions.push(this.generator.predict(this.input))
      newPredictions.push(this.generator.predict(this.input))
      newPredictions.push(this.generator.predict(this.input))
      newPredictions.push(this.generator.predict(this.input))
      newPredictions.push(this.generator.predict(this.input))
      this.predictions = newPredictions
      this.predicting = false
    }
  }
}
</script>

<style>
#textarea-small {
  height: 150px;
  margin-bottom: 20px;
}

.hello {
  margin-top: 70px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

input {
  color: #ffffff;
  width: 500px;
  border: 0;
  outline: 0;
  background: transparent;
  border-bottom: 2px solid #ffffff;
}
</style>