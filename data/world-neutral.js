/* =====================================================
   ONE OS – WORLD CONFIG (Neutral Demo World)
===================================================== */

window.LucenWorld = {

  masterFields: [

    {
      id: "clarity",
      name: "Clarity Movement",
      short: "Wellbeing • Awareness • Growth",

      fields: [
        {
          id: "help",
          name: "Help To Heal",
          short: "Healing tools and emotional support",

          modules: [
            {
              id: "tools",
              name: "Healing Tools",
              short: "Regulation, grounding, emotional clarity",
              minis: [
                { id: "breath", name: "Breathing", body: "Calm system reset" },
                { id: "steps", name: "Progress Steps", body: "Micro movement" }
              ]
            }
          ]
        }
      ]
    },

    {
      id: "education",
      name: "Educational Freedom",
      short: "Learning that adapts to the child",

      fields: [
        {
          id: "learn",
          name: "Learning Tools",
          short: "Adaptive learning field",

          modules: [
            {
              id: "math",
              name: "Math Tools",
              short: "Number sense & intuition",
              minis: [
                { id: "count", name: "Counting", body: "Understanding quantity" },
                { id: "shape", name: "Shapes", body: "Geometric awareness" }
              ]
            }
          ]
        }
      ]
    }

  ]

};
