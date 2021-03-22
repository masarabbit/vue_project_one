
function init() {
  const updateInterval = 1000 * 60 * 5

  
  async function getTflData() {
    try {
      const { data } = await axios.get('https://api.tfl.gov.uk/line/mode/tube/status')
      if (data) app.message = null    
      console.log(data)
      populatePage(data)

    } catch (err){
      console.log(err)
    }
  } 
  
  const populatePage = dataArray =>{
    app.trainlines = []
    dataArray.forEach(data =>{
      app.trainlines.push({ 
        linename: data.name,
        lineclass: data.id,
        status: data.lineStatuses[0].statusSeverityDescription,
        statusclass: data.lineStatuses[0].statusSeverityDescription.replace(' ','_').toLowerCase(),
        reason: data.lineStatuses[0].reason ?
          data.lineStatuses[0].reason.split(':').slice(1).join(':')
          :
          null
      })
    })
  }
  
  let storeData 
  const app = new Vue({ 
    el: '#app',
    data: {
      message: 'loading',
      trainlines: [],
      badservicehidden: false
    },
    methods: {
      sortTrainLines: function(){
        this.trainlines = this.trainlines.reverse()
      },
      hideBadService: function(){
        storeData = this.trainlines // note, this stores old info
        this.trainlines = this.trainlines.filter((trainline)=>trainline.status === 'Good Service')
        this.badservicehidden = true
      },
      showAllService: function(){
        this.trainlines = storeData
        this.badservicehidden = false
      }
    },
    computed: {
      displayUpdateTime: function(){
        const now = new Date()
        const minutes = String(now.getMinutes()).length === 2 ?
          now.getMinutes()
          :
          '0' + now.getMinutes()      
        return `Last updated: ${now.getHours()}:${minutes} ${now.toDateString()}`
      },
      overallStatus: function() {
        let goodServices = 0
        this.trainlines.forEach(trainline=>{
          if (trainline.status === 'Good Service') goodServices++
        })
        return goodServices > 1 ?
          `${goodServices} lines have Good Service`
          :
          `${goodServices} line have Good Service`
      }
    }
  })


  getTflData()
  setInterval(()=>{
    getTflData()
  },updateInterval)
  

}

window.addEventListener('DOMContentLoaded', init)