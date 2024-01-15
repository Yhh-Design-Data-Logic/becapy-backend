import { onCall } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

export const createSocialQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const facebook = data.data.facebook;
    const instagram = data.data.instagram;
    const twitter = data.data.twitter;
    const linkedIn = data.data.linkedIn;
    const preview = getPreviewCode(data);
    let routing_url = "https://qr-code-generator-all-features.webflow.io/redirector?id=";

    var createdId = "none";
    try {
        await admin
            .firestore()
            .collection("qr_codes").add({
                routing_url: "",
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "Social",
                uid: uid,
                facebook: facebook,
                instagram: instagram,
                linkedIn: linkedIn,
                twitter: twitter,
                preview: preview
            }).then(async (result) => {
                routing_url = routing_url + result.id;
                await admin
                    .firestore()
                    .collection("qr_codes").doc(result.id).update({
                        routing_url: routing_url + result.id,
                        qr_code_url: `https://qr-code-generator-all-features.webflow.io/redirector?id=${result.id}`
                    });
                createdId = result.id;
                return "Done";
            });
    } catch (e) {
        return {
            "message": "Error While Creating!",
        };
    }
    return {
        routing_url: routing_url,
        "id": createdId, "message": "Created Successfully", "is_static": is_static,
        "password": "", // QR Password "No Need"
        "corporate_id": corporate_id,
        "type": "wifi",
        "uid": uid,
    };
});

export const updateSocialQRCode = onCall(async (data) => {
    console.log("data = " + data);
    const is_static = data.data.is_static;
    const corporate_id = data.data.corporate_id;
    const uid = data.data.uid;
    const idForUpdate = data.data.idForUpdate;
    const facebook = data.data.facebook;
    const instagram = data.data.instagram;
    const twitter = data.data.twitter;
    const linkedIn = data.data.linkedIn;
    const preview = getPreviewCode(data);
    let routing_url = "";
    try {
        await admin
            .firestore()
            .collection("qr_codes").doc(idForUpdate).get().then(result => {
                routing_url = result?.data()?.routing_url;
            });

        await admin
            .firestore()
            .collection("qr_codes").doc(idForUpdate)
            .update({
                is_static: is_static,
                password: "", // QR Password "No Need"
                corporate_id: corporate_id,
                type: "Social",
                uid: uid,
                facebook: facebook,
                instagram: instagram,
                linkedIn: linkedIn,
                twitter: twitter,
                preview: preview
            });
    } catch (e) {
        return {
            "message": "Error While Creating!",
        };
    }
    return {
        routing_url: routing_url,
        "id": idForUpdate, "message": "Updated Successfully", "is_static": is_static,
        "password": "", // QR Password "No Need"
        "corporate_id": corporate_id,
        "type": "Social",
        "uid": uid,
    };
});


const getPreviewCode = (data: any) => {
    return `<!DOCTYPE html><html lang="en">` + "<head>" + data.data.headContent + "</head>" + `<body style="
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    background-color: #f5e4e4;
    font-family: 'Jost', sans-serif;
    display: flex;
    flex-direction: column;
  ">` + getCode(data) + 
  `<script type="module">
    document.getElementById('facebook-preview-id').addEventListener('click', () => { 
        window.open(${data.data.facebook}, "_blank");
    });
    document.getElementById('instagram-preview-id').addEventListener('click', () => { 
        window.open(${data.data.instagram}, "_blank");
    });
    document.getElementById('linkedin-preview-id').addEventListener('click', () => { 
        window.open(${data.data.linkedIn}, "_blank");
    });
    document.getElementById('twitter-preview-id').addEventListener('click', () => { 
    window.open(${data.data.twitter}, "_blank");
    });
    </script>` + "</body></html>";
}

const getCode = (data: any) => {
    return `
    <div id="preview-body-inside" class="previewinsidebody">
    <div>Follow me on Social Media</div>
    <div class="text-block-45">Let me gain as much as possible can from the followers number please.</div>
    <div class="sociallinksdiv"><div id="facebook-preview-id" class="socialiconpreview">
    <img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/651e5cf2e78c11856aa119c3_devicon_facebook.svg" loading="lazy" width="18" alt="" class="image-62"></div>
    <div id="instagram-preview-id" class="socialiconpreview"><img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/651e5c9b27e3d289f4656513_skill-icons_instagram.svg" loading="lazy" width="18" alt="" class="image-62"></div></div>
    <div class="sociallinksdiv"><div id="linkedin-preview-id" class="socialiconpreview"><img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/651e5c9cf9a6cd4542f42fd6_linkedin.svg" loading="lazy" width="18" alt="" class="image-62"></div>
    <div id="twitter-preview-id" class="socialiconpreview"><img src="https://assets-global.website-files.com/64ec3e20469d6a03a29bbb29/65410e45f6f9966d52a43ff5_%5B16%5Dhs97_ico_close.svg" loading="lazy" width="18" alt="" class="image-62"></div></div></div>
    `;
}
