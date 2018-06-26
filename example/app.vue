<template>
    <ul
        id="app"
        v-scroll
    >
        <li
            class="app-item"
            v-for="item in items"
            :key="item"
        >{{item}}</li>
    </ul>
</template>
<script>
export default {
    data () {
        return {
            items: []
        }
    },
    created () {
        for (let i = 1; i < 50; i++) {
            this.items.push(i);
        }
    }
}
</script>
<style>
* {
    margin: 0;
    padding: 0;
}
.app-item {
    list-style: none;
    height: 30px;
    border-top: 1px solid #e2e2e2;
    text-align: center;
    line-height: 30px;
}
</style>

