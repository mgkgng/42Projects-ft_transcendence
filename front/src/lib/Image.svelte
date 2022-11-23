<script>

let fileInput, avatar;

const onFileSelected = (e) => {
let image = e.target.files[0];
    let reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onload = e => {
             avatar = e.target.result
        };
}

const uploadImage = async () => {
    let formData = new FormData();
    console.log("here");
    formData.append("image", avatar);
    formData.append("avatar", fileInput.files[0]);

    // Formdata with jwt token
    let jwt = localStorage.getItem("transcendence-jwt");

    let response = await fetch("http://localhost:3000/uploadimage", {
        method: "POST",
        body: formData,
        headers: new Headers({ "Authorization": `Bearer ${jwt}` })
    });

    let result = await response.json();
    console.log("uploadImage",result);
}
</script>

<div class="divImageUpload">
	{#if avatar}
		<img class="avatar" src="{avatar}" alt="d" />
    {:else}
    	<img class="avatar" src="https://cdn4.iconfinder.com/data/icons/small-n-flat/24/user-alt-512.png" alt="" /> 
    {/if}
	<div class="chan" on:click={()=>{fileInput.click();}}>Choose Image</div>
	<input style="display:none" type="file" accept=".jpg, .jpeg, .png" on:change={(e) => onFileSelected(e)}
	 bind:this={fileInput}/>
	<button on:click={uploadImage}>UPLOAD</button>
</div>

<style>

	.divImageUpload {
		background-color: red;
	}

	.upload{
		display:flex;
		height:3em;
		width:3em;
		cursor:pointer;
	}
	.avatar{
		display:flex;
		height:10em;
		width:10em;
	}

	button {
		background-color: blue;
	}
</style>