<script src="./script.js"></script>
<style lang="stylus">@import "./style.styl";</style>
<template lang="pug">
div.greetings
  h1.green {{ msg }}
  h3
    span You’ve successfully created a project with 
    a(target="_blank" href="https://vitejs.dev/") Vite
    span  + 
    a(target="_blank" href="https://vuejs.org/") Vue 3
    span .
</template>