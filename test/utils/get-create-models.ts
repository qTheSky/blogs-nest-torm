export const getCreateModels = <M>(
  count: number,
  createModel: M,
  uniquePropertyName: keyof M,
  secondUniqueProperty?: keyof M,
  secondUniqueProperties?: string[],
): M[] => {
  const modelsArray: M[] = [];
  const uniqueArray = [
    'Ivan', //+
    'Divan', //+
    'test1',
    'test2',
    'test4',
    'test5',
    'test6',
    'test7',
    'test8',
    'Vandam', //+
    'JanClod',
    'newest',
  ];
  for (let i = 0; i < count; i++) {
    if (secondUniqueProperty) {
      modelsArray.push({
        ...createModel,
        [uniquePropertyName]: uniqueArray[i],
        [secondUniqueProperty]: secondUniqueProperties[i],
      });
    } else {
      modelsArray.push({
        ...createModel,
        [uniquePropertyName]: uniqueArray[i],
      });
    }
  }
  return modelsArray;
};
