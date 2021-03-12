let isFormReady = false;

function checkForm() {
    if (isFormReady) return true;
    conf();
    return false;
}

function conf() {
    if ($('.pass').val() !== $('.confpass').val()) {
        $('.errormsg').text("Passwords don't match").addClass("bg-danger")
    }
    else {
        isFormReady = true;
        $("#mainform").submit();
    }
}

function jobUpdate() {
    let jTitleUpdate = $('#jobTitle').val();
    let cNameUpdate = $('#companyName').val();
    let salUpdate = $('#salary').val();
    let desUpdate = $('#jobDescription').val();
    let locUpdate = $('#joblocation').val();
    let iDvalue = $('#disabledInput').val();

    $.ajax({
        url: "/jobpost/update/?_id=" + iDvalue + "&companyName=" + cNameUpdate + "&jobTitle=" + jTitleUpdate + "&joblocation=" + locUpdate + "&jobDescription=" + desUpdate + "&salary=" + salUpdate,
        method: "put",
        success: (response) => {location.reload()},
        error: (error) => {console.log("It's an error:", error)}
    });

}

function jobApply() {
    let jobID = $('#job-id-apply').text();
    let appID = $('#userID').val();
    let fNameApply = $('#fNameApply').val();
    let lNameApply = $('#lNameApply').val();
    let emailApply = $('#emailApply').val();
    let phNumApply = $('#phNumApply').val();

    $.ajax({
        url: "/applyjob/apply/?jobID=" + jobID + "&appID=" + appID + "&firstName=" + fNameApply + "&lastName=" + lNameApply + "&email=" + emailApply + "&phoneNumber=" + phNumApply,
        method: "post",
        success: (response) => {location.reload()},
        error: (error) => {console.log("It's an error:", error)}
    });
}

function deleteJobPost(fetch) {
        let value = $(fetch).closest('tr').find("#jTitle").attr("value");

        $.ajax({
            url: "/jobpost/delete/" + value,
            method: "delete",
            success: (response) => {location.reload()},
            error: (error) => {console.log("It's an error:", error)}
        });
  }

  function shortlistApplication(fetch) {
        let value = $(fetch).closest('tr').find("#name").attr("value");
        let recID = $('#recID').val();
        
        $.ajax({
            url: "/shortlist/id/" + value + "/recid/" + recID,
            method: "post",
            success: (response) => {location.reload()},
            error: (error) => {console.log("It's an error:", error)}
        });
  }

  function viewThatJob(fetch) {
        let value = $(fetch).closest('tr').find("#name").attr("jobID");
        let fName = $('#fNameUpdate').val();
        let userID = $('#userID').val();
        window.open("/job/id/" + value + "/recid/" + userID + "/name/" + fName, "_self");
}

  function removeFromShortlist(fetch) {
        let value = $(fetch).closest('tr').find("#name").attr("value");

        $.ajax({
            url: "/shortlist/delete/" + value,
            method: "delete",
            success: (response) => {location.reload()},
            error: (error) => {console.log("It's an error:", error)}
        });
  }

  function deleteApplication(fetch) {
    let value = $(fetch).closest('tr').find("#name").attr("value");

        $.ajax({
            url: "/applyjob/delete/" + value,
            method: "delete",
            success: (response) => {location.reload()},
            error: (error) => {console.log("It's an error:", error)}
        });
  }
  
  function viewProfile() {
    let userID = $('#userID').val();
    window.open("/profile/id/" + userID, "_self");
  }

  function viewJobPost(fetch) {
        let value = $(fetch).closest('tr').find("#jTitle").attr("value");
        let name = $('#name').val();
        let recID = $('#userID').val();
        window.open("/job/id/" + value + "/recid/" + recID + "/name/" + name, "_self")
  }  

  function viewAppliedJobPost(fetch) {
        let value = $(fetch).closest('tr').find("#jTitle").text();
        let appID = $(fetch).closest('tr').find("#jTitle").attr("appid");
        window.open("/appliedjob/id/" + value + '/appid/' + appID, "_self")
  }

  function viewJobPostAsApplicant(fetch) {
        let value = $(fetch).closest('#recent-jobs').find("#jTitle").attr("value");
        let appID = $(fetch).closest('#recent-jobs').find("#jTitle").attr("appid");
        window.open("/viewjob/id/" + value + "/appid/" + appID, "_self")
  }

  function viewReceivedApps(fetch) {
        let value = $(fetch).closest('tr').find("#jTitle").attr("value");
        let recID = $('#userID').val();
        let name = $('#name').val();
        window.open("/received-applications/id/" + value + "/recid/" + recID + "/name/" + name, "_self")
  }