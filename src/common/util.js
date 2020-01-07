const getRandomInt = (min, max) => {
  return Math.round(Math.random() * (max - min + 1) + min)
}

export const shuffle = arr => {
  const newArr = arr.slice(0)
  for (let i = 0; i < newArr.length; i++) {
    const j = getRandomInt(0, i)
    const t = newArr[i]
    newArr[i] = newArr[j]
    newArr[j] = t
  }
  return newArr
}
