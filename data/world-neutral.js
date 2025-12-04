/* ============================================================
   LUCEN OS – NEUTRAL WORLD DATA
   This file defines the world the engine renders.
   Guaranteed valid structure.
============================================================ */

window.LucenWorld = {
  masterFields: [
    {
      id: "clarity",
      name: "Clarity Movement",
      short: "Wellbeing • Awareness • Growth",

      fields: [
        {
          id: "clarity-field-1",
          name: "Emotional Clarity",
          short: "Tools for self-awareness",

          modules: [
            {
              id: "clarity-mod-1",
              name: "Breathwork Module",
              short: "Simple daily grounding practices",

              minis: [
                {
                  id: "clarity-mini-1",
                  name: "Daily Reset",
                  body: "A short guided breathing cycle designed for clarity."
                },
                {
                  id: "clarity-mini-2",
                  name: "Stress Release",
                  body: "A rhythm-based exhale pattern to discharge tension."
                }
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
          id: "edu-field-1",
          name: "Core Learning",
          short: "Foundational learning sequences",

          modules: [
            {
              id: "edu-mod-1",
              name: "LearnSpace",
              short: "A flexible module for adaptable learning",

              minis: [
                {
                  id: "edu-mini-1",
                  name: "Literacy Pulse",
                  body: "A micro-module for daily literacy growth."
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};
