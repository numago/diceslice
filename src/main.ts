import { mount } from 'svelte'
import App from './App.svelte'

const root = mount(App, {
  target: document.getElementById('app')!
})

export default root 