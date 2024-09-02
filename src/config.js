import path from 'node:path'

const repoUrlData = {
  react: 'https://github.com/xiaobaili1992/react-template.git',
  vue: 'https://github.com/xiaobaili1992/vue-template.git',
}

const getLocalPath = (projectName) => {
  return path.join(process.cwd(), projectName)
};

const getFilePath = (projectName, fileName) => {
  return path.join(getLocalPath(projectName), fileName)
};

export { repoUrlData, getLocalPath, getFilePath };