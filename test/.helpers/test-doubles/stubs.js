export const stubListReducer = jest.fn((previousList, eventPayload) => {
  return previousList.concat([ eventPayload * 2 ]);
});

export const stubBasicCallback = jest.fn(() => undefined);
export const stubEffectsCallback = jest.fn(() => () => undefined);

export const stubDialogProcessFactory = (type: "alert" | "confirm" | "prompt", returnType: boolean | void) => (function () {

    const prompts = {
      alert: function () {
        return;
      },
      prompt: jest.fn().mockImplementation(() => returnType),
      confirm: jest.fn().mockImplementation(() => returnType)
    };
  
    return prompts[type];
}());
