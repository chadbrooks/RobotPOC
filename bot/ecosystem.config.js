module.exports = {
  apps: [
  {
    name: 'mako-01',
    script: 'index.js',
    env: {
      "robotId": 1001,
      "hospitalCode": "MIA",
      "locationCode": "USFL",
      "endorsements": [
        "PKA",
        "TKA",
        "THA"
      ],
      "robotStatus": false
    }
  }, {
    name: 'mako-02',
    script: 'index.js',
    env: {
      "robotId": 1002,
      "hospitalCode": "SJC",
      "locationCode": "USCA",
      "endorsements": [
        "PKA",
        "THA"
      ],
      "robotStatus": true

    }
  }, {
    name: 'mako-03',
    script: 'index.js',
    env: {
      "robotId": 1003,
      "hospitalCode": "MUC",
      "locationCode": "ERGR",
      "endorsements": [
        "PKA",
        "THA"
      ],
      "robotStatus": true
    }
  }, {
    name: 'mako-04',
    script: 'index.js',
    env: {
      "robotId": 1004,
      "hospitalCode": "KLM",
      "locationCode": "EUUK",
      "endorsements": [
        "THA"
      ],
      "robotStatus": true
    }
  }, {
    name: 'mako-05',
    script: 'index.js',
    env: {
      "robotId": 1005,
      "hospitalCode": "NYC",
      "locationCode": "USNY",
      "endorsements": [
        "PKA",
        "TKA",
        "THA"
      ],
      "robotStatus": false
    }
  }, {
    name: 'mako-06',
    script: 'index.js',
    env: {
      "robotId": 1006,
      "hospitalCode": "DEL",
      "locationCode": "APIN",
      "endorsements": [
        "PKA",
        "THA"
      ],
      "robotStatus": true
    }
  }, {
    name: 'mako-07',
    script: 'index.js',
    env: {
      "robotId": 1007,
      "hospitalCode": "DCA",
      "locationCode": "USDC",
      "endorsements": [
        "PKA",
        "TKA",
        "THA"
      ],
      "robotStatus": true
    }
  }, {
    name: 'mako-08',
    script: 'index.js',
    env: {
      "robotId": 1008,
      "hospitalCode": "MIA",
      "locationCode": "USFL",
      "endorsements": [
        "PKA",
        "TKA"
      ],
      "robotStatus": true
    }
  }, {
    name: 'mako-09',
    script: 'index.js',
    env: {
      "robotId": 1009,
      "hospitalCode": "MIA",
      "locationCode": "USFL",
      "endorsements": [
        "PKA",
        "TKA",
        "THA"
      ],
      "robotStatus": true
    }
  }, {
    name: 'mako-10',
    script: 'index.js',
    env: {
      "robotId": 1010,
      "hospitalCode": "SJC",
      "locationCode": "USCA",
      "endorsements": [
        "THA"
      ],
      "robotStatus": true
    }
  },
    ]
};
