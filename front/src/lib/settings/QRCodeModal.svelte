<style lang="scss">
    .qrcode {
        width: 400px;
        height: 500px;
        padding: .2em;

        justify-content: center;
        align-items: center;

        h3 {
            width: 100%;
            text-align: center;
        }
        .qrcode-wrapper {
            border: $border-thin;
            border-radius: .4em;
            padding: .5em;

            img {
                border-radius: .2em;
            }
        }
        .verify {
            width: 100%;
            gap: .2em;
            justify-content: center;

            input {
                width: 60%;
                height: 2em;
                background-color: #fff;
                padding-left: .5em;
                border-radius: .2em;
                color: #000;
            }
            button {
                background-color: $submain-lowshadeblue;
                width: 3em;
                height: 2em;
                border-radius: .2em;

                &:hover {
                    filter: brightness(85%);
                }
            }
        }
    }
</style>

<script type="ts">
    import { client } from "$lib/stores/client";
    import { onMount } from "svelte";
    
    export let qrCodeUrl : any;

    let verifKey: string = "";
    let verifLoading: boolean = false;

    onMount(() => {
        $client.socket.on('verify2FAKeyRes', (data: any) => {

        });
    });
</script>

<div class="window vflex qrcode">
    <h3>Scan the QR code with Google Authenticator</h3>
    <div class="qrcode-wrapper">
        <img src={qrCodeUrl} />
    </div>
    <div class="flex verify">
        <input type="text-input" placeholder="Code for validation" bind:value={verifKey}>
        <button class="{verifLoading ? "loading" : ""}" on:click={() => {
            $client.socket.emit('verify2FAKey', verifKey);
        }}>{(!verifLoading) ? "Verify" : ""}</button>
    </div>
</div>