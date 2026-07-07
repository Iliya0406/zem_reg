
const SUPABASE_URL =
'https://iztulqvwgypllvorakot.supabase.co';

const SUPABASE_ANON_KEY =
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6dHVscXZ3Z3lwbGx2b3Jha290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5MDQwMTIsImV4cCI6MjA5NzQ4MDAxMn0.QycfvdlrB4vSbcPwgwmDcUp70k4-ZaSq3YT8L6Pops0';

const supabaseClient =
supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

/*async function testConnection() {

    const { data, error } =
        await supabaseClient
        .from('programs')
        .select('*');

    if(error){
        console.error(error);
        return;
    }

    console.log("Programs Table:");

    console.table(data);
}

testConnection();
*/


window.signup = async function(){

    const fullName =
        document.getElementById('fullName').value.trim();

    const phone =
        document.getElementById('phone').value.trim();

    const profession =
        document.getElementById('profession').value.trim();

    const residence =
        document.getElementById('residence').value.trim();

    const ageGroup =
        document.getElementById('ageGroup').value;

    const maritalStatus =
        document.getElementById('maritalStatus').value;

    const password =
        document.getElementById('password').value;

    const message =
        document.getElementById('message');

    if(
        !fullName ||
        !phone ||
        !profession||
        !residence ||
        !ageGroup ||
        !maritalStatus ||
        !password
    ){
        message.innerText =
            "Please complete all fields.";

        return;
    }

    const email =
        phone + "@registration.com";

    const { data, error } =
        await supabaseClient.auth.signUp({

            email: email,

            password: password

        });
    if (data?.user) {
        console.log("User created:", data.user.id);
    }

    if(error){

        message.innerText =
            error.message;

        return;
    }
    
    const { error: participantError } =
        await supabaseClient
        .from('participants')
        .insert([{

        id: data.user.id,

        full_name: fullName,

        phone: phone,

        profession: profession,

        residence: residence,

        age_group: ageGroup,

        marital_status: maritalStatus

    }]);

    if(participantError){

        console.error(participantError);

        message.innerText =
            participantError.message;

        return;
    }

    message.innerText =
        "Registration successful! Redirecting...";

        window.location.href = "dashboard.html";
}

// Add Login Fxn

window.login = async function() {

    console.log("Login button clicked");

    const phone =
        document.getElementById('phone').value.trim();

    const password =
        document.getElementById('password').value;

    const email =
        phone + "@registration.com";

    console.log("Email:", email);

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

    console.log("Data:", data);
    if (error) {
        alert("Login error: ", error);
        console.error(error);
        return;
    }
    

    if(error){

        document.getElementById('message')
            .innerText = error.message;

        return;
    }

    console.log("Redirecting...");

    alert("Login successful. Redirecting...")
    window.location.href = "dashboard.html";
}


// Add Dashboard Functions

async function loadProfile() {

    console.log("Loading profile...");

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    console.log("User:", user);

    if (!user) {

        console.log("No user found");

        return;
    }

    const { data, error } =
        await supabaseClient
        .from('participants')
        .select('*')
        .eq('id', user.id)
        .single();

    console.log("Participant Data:", data);
    console.log("Participant Error:", error);

    if(error){
        alert(error.message);
        return;
    }

    document.getElementById('welcome').innerText =
        "Welcome, " + data.full_name;

    loadPrograms();
    loadMyRegistrations();
}

async function logout(){

    console.log("Loading programs...");

    await supabaseClient.auth.signOut();

    window.location.href =
        "login.html";
}

if(
    window.location.pathname.includes(
        "dashboard.html"
    )
){
    loadProfile();
}

// Load Prograns

async function loadPrograms() {

    const { data, error } =
        await supabaseClient
        .from('programs')
        .select('*')
        .order('event_date', { ascending: true });

        console.log("Programs Data:", data);
        console.log("Programs Error:", error);

    if(error){

        console.error(error);
        return;
    }

    const container =
        document.getElementById('programsContainer');

    container.innerHTML = '';

    data.forEach(program => {

        container.innerHTML += `

        <div class="program-card">

            <h4>${program.title}</h4>

            <p>${program.description}</p>

            <p>
                <strong>Date:</strong>
                ${program.event_date}
            </p>

            <p>
                <strong>Venue:</strong>
                ${program.venue}
            </p>

            <button
                onclick="registerProgram('${program.id}')">

                Register

            </button>

        </div>

        `;
    });
}

// Register for a program fxn

window.registerProgram = async function(programId) {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if (user) {
        window.location.href = "dashboard.html";
    }// this check if user already exist.

    const { error } =
        await supabaseClient
        .from('registrations')
        .insert([
            {
                participant_id: user.id,
                program_id: programId
            }
        ]);

    if(error){

        if(error.message.includes("unique")){

            alert(
                "You are already registered for this program."
            );

            return;
        }

        alert(error.message);
        return;
    }

    // alert(
    //     "Program registered successfully!"
    // );

    document.getElementById('message').innerText =
    "Account created successfully! Redirecting...";

    loadMyRegistrations();
    //This updates the dashboard immediately after registration.

    setTimeout(() => {

        window.location.href = "dashboard.html";

    }, 1000);

}


// Load Registered Prorams

async function loadMyRegistrations() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    console.log("Current User ID:", user.id);

    const { data, error } =
        await supabaseClient
        .from('registrations')
        .select(`
            program_id,
            programs (
                title,
                event_date,
                venue
            )
        `)

        .eq('participant_id', user.id);

    console.log("Registrations:", data);
    console.log("Registration Error:", error);

   

    if(error){
        console.error(error);
        return;
    }

    const container =
        document.getElementById('myRegistrations');

    container.innerHTML = '';

    if(data.length === 0){

        container.innerHTML =
            '<p>No registrations yet.</p>';

        return;
    }

    data.forEach(registration => {

        const program =
            registration.programs;

        container.innerHTML += `

            <div class="program-card">

                <h4>${program.title}</h4>

                <p>
                    <strong>Date:</strong>
                    ${program.event_date}
                </p>

                <p>
                    <strong>Venue:</strong>
                    ${program.venue}
                </p>

                <p>
                    ✅ Registered
                </p>

            </div>

        `;
    });
}


// Check Admin Access

async function checkAdmin() {

    const {
        data: { user }
    } = await supabaseClient.auth.getUser();

    if(!user){

        window.location.href =
            "login.html";

        return;
    }

    const { data, error } =
        await supabaseClient
        .from('admins')
        .select('*')
        .eq('id', user.id)
        .single();

    if(error){

        alert("Access Denied");

        window.location.href =
            "dashboard.html";

        return;
    }

    document.getElementById("adminName")
        .innerText =
        "Welcome Admin: " +
        data.username;

    loadStatistics();

    loadProgramsAdmin();

    loadParticipants();

    loadRegistrations();
}

// Load Statistics

async function loadStatistics() {

    const participants =
        await supabaseClient
        .from('participants')
        .select('*', { count: 'exact', head: true});

    const programs =
        await supabaseClient
        .from('programs')
        .select('*', { count: 'exact', head: true });

    const registrations =
        await supabaseClient
        .from('registrations')
        .select('*', { count: 'exact', head: true });

    document.getElementById(
        'totalParticipants'
    ).innerText =
        participants.count || 0;

    document.getElementById(
        'totalPrograms'
    ).innerText =
        programs.count || 0;

    document.getElementById(
        'totalRegistrations'
    ).innerText =
        registrations.count || 0;
}

// Load Admin Dashboard Automatically

if(
    window.location.pathname.includes(
        "admin.html"
    )
){
    checkAdmin();
}


//Admin Login Function

window.adminLogin = async function() {

    const email =
        document.getElementById(
            'adminEmail'
        ).value.trim();

    const password =
        document.getElementById(
            'adminPassword'
        ).value;

    const { error } =
        await supabaseClient.auth
        .signInWithPassword({

            email,
            password

        });

    if(error){

        document.getElementById(
            'message'
        ).innerText =
            error.message;

        return;
    }

    window.location.href =
        "admin.html";
}


// Create Program Function

window.createProgram = async function() {

    const title =
        document.getElementById('title').value.trim();

    const description =
        document.getElementById('description').value.trim();

    const eventDate =
        document.getElementById('eventDate').value;

    const venue =
        document.getElementById('venue').value.trim();

    document.getElementById(
        'cancelEditBtn'
    ).style.display =
        "none";

    if(
        !title ||
        !description ||
        !eventDate ||
        !venue
    ){
        alert("Please complete all fields.");
        return;
    }

    // Check whether a program already exists

    const { count, error: countError } =
        await supabaseClient
        .from('programs')
        .select('*', {
            count: 'exact',
            head: true
        });

    if(countError){

        alert(countError.message);
        return;
    }

    if(count > 0 && !window.editingProgramId){

        alert(
            "Only one program can exist at a time. Please delete the current program first."
        );

        return;
    }

    //let error;
    let isEditing =
        !!window.editingProgramId;

    if(window.editingProgramId){

        ({ error } =
            await supabaseClient
            .from('programs')
            .update({
                title,
                description,
                event_date: eventDate,
                venue
            })
            .eq('id',
                window.editingProgramId));

            //alert("Program updated successfully!");            

            window.editingProgramId = null;
            document.getElementById(
                'saveProgramBtn'
            ).innerText =
                "Create Program";

    }else{

        // Existing insert code remains here
        ({ error } =
            await supabaseClient
            .from('programs')
            .insert([
                {
                    title,
                    description,
                    event_date: eventDate,
                    venue
                }
            ]));
    }

    

    if(error){

        alert(error.message);
        return;
    }

    // if(window.editingProgramId === null){

    //     // update was successful

    //     alert("Program updated successfully!");
    // }else{

    //     alert("Program created successfully!");
    // }

    //     alert("Program created successfully!");

    alert(
        isEditing
        ? "Program updated successfully!"
        : "Program created successfully!"
);


    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('venue').value = '';

    loadProgramsAdmin();
    loadStatistics();
}


// Load Programs for Admin

async function loadProgramsAdmin() {

    const { data, error } =
        await supabaseClient
        .from('programs')
        .select('*')
        .order('event_date');

    if(error){

        console.error(error);
        return;
    }

    const container =
        document.getElementById('programList');

    container.innerHTML = '';

    data.forEach(program => {

        container.innerHTML += `

            <div class="program-card">

                <h3>${program.title}</h3>

                <p>${program.description}</p>

                <p>
                    Date:
                    ${program.event_date}
                </p>

                <p>
                    Venue:
                    ${program.venue}
                </p>

                <button onclick="editProgram('${program.id}')">
                    Edit/update
                </button>

                <button
                    onclick="deleteProgram('${program.id}')">
                    Delete
                </button>

            </div>

        `;
    });
}

// Edit program

window.editProgram = async function(id){

    console.log("Editing Program ID:", id);

    const { data, error } =
        await supabaseClient
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

    console.log("Returned Data:", data);
    console.log("Returned Error:", error);

    if(error){

        alert(error.message);
        return;
    }

    document.getElementById('title').value = data.title;
    document.getElementById('description').value = data.description;
    document.getElementById('eventDate').value = data.event_date;
    document.getElementById('venue').value = data.venue;

    window.editingProgramId = id;

// Change button text
    document.getElementById(
        'saveProgramBtn'
    ).innerText =
        "Update Program";

// Show the Cancel button

    document.getElementById(
            'cancelEditBtn'
        ).style.display = 
            "inline-block";


    /* Optional */
// scroll to the form

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

    console.log("editingProgramId:", window.editingProgramId);
}


/*window.editProgram = async function(id){

    console.log("Editing Program ID:", id);

    const { data, error } =
        await supabaseClient
        .from('programs')
        .select('*')
        .eq('id', id)
        .single();

    console.log("Returned Data:", data);
    console.log("Returned Error:", error);

    if(error){

        alert(error.message);
        return;
    }

    document.getElementById('title').value = data.title;
    document.getElementById('description').value = data.description;
    document.getElementById('eventDate').value = data.event_date;
    document.getElementById('venue').value = data.venue;

    window.editingProgramId = id;


    console.log("editingProgramId:", window.editingProgramId);
}*/


//Delete Program

window.deleteProgram = async function(id) {

// First delete registrations
const { error: regError } =
    await supabaseClient
    .from('registrations')
    .delete()
    .eq('program_id', id);

if (regError) {
    alert(regError.message);
    return;
}

// Then delete the program
const { error: programError } =
    await supabaseClient
    .from('programs')
    .delete()
    .eq('id', id);

if (programError) {
    alert(programError.message);
    return;
}

alert("Program deleted successfully.");


    /*const confirmDelete =
        confirm(
            "Delete this program?"
        );

    if(!confirmDelete){

        return;
    }

    const { error } =
        await supabaseClient
        .from('programs')
        .delete()
        .eq('id', id);

    if(error){

        alert(error.message);
        return;
    }

    alert("Program deleted.");

    loadProgramsAdmin();
    loadStatistics();*/
}


//Load Participants

async function loadParticipants() {

    const { data, error } =
        await supabaseClient
        .from('participants')
        .select('*')
        .order('full_name');

    if(error){

        console.error(error);
        return;
    }

    window.allParticipants = data;

    displayParticipants(data);
}



// Display Participants

function displayParticipants(participants){

    const container =
        document.getElementById(
            'participantsList'
        );

    container.innerHTML = '';

    participants.forEach(participant => {

        container.innerHTML += `

            <div class="program-card">

                <h3>
                    ${participant.full_name}
                </h3>

                <p>
                    Phone:
                    ${participant.phone}
                </p>

                <p>
                    Residence:
                    ${participant.residence}
                </p>

            </div>

        `;
    });
}


// Search Participants

window.searchParticipants =
function() {

    const searchText =
        document.getElementById(
            'searchParticipant'
        )
        .value
        .toLowerCase();

    const filtered =
        window.allParticipants
        .filter(p =>

            p.full_name
            .toLowerCase()
            .includes(searchText)

            ||

            p.phone
            .includes(searchText)

        );

    displayParticipants(filtered);
}


//Load Registrations

async function loadRegistrations() {

    const { data, error } =
        await supabaseClient
        .from('registrations')
        .select(`
            registration_date,
            participants (
                full_name,
                phone,
                residence
            ),
            programs (
                title
            )
        `);

    console.log("Registrations:", data);

    data.forEach(item => {
        console.log(item);
    });

    if(error){

        console.error(error);
        return;
    }

    displayRegistrations(data);
}


//Display Registrations

function displayRegistrations(data){

    const container =
        document.getElementById(
            'registrationsList'
        );

    container.innerHTML = '';

    if(data.length === 0){

        container.innerHTML =
            '<p>No registrations found.</p>';

        return;
    }

    const grouped = {};

    data.forEach(registration => {

        const programTitle =
            registration.programs.title;

        if(!grouped[programTitle]){

            grouped[programTitle] = [];
        }

        grouped[programTitle].push(registration);
    });

    for(const program in grouped){

        const registrations =
            grouped[program];

        container.innerHTML += `

            <div class="program-card">

                <h3>
                    ${program}
                </h3>

                <p>
                    <strong>
                        ${registrations.length}
                    </strong>

                    Registrant(s)
                </p>

                <div id="
                    group-${program.replace(/\s+/g,'-')}
                ">
                </div>

            </div>

        `;

        let participantsHtml = '';

        registrations.forEach(reg => {

            participantsHtml += `

                <p>
                    ✅
                    ${reg.participants?.full_name || 'Unknown'}
                    (${reg.participants?.phone || 'No Phone'})
                </p>

            `;
        });

        container.innerHTML += `

            <div class="program-card">

                <h3>${program}</h3>

                <p>
                    <strong>
                        ${registrations.length}
                    </strong>

                    Registrant(s)
                </p>

                ${participantsHtml}

            </div>

        `;
    }
}


// Export Function CSV

/*window.exportRegistrationsCSV =
async function() {

    const { data, error } =
        await supabaseClient
        .from('registrations')
        .select(`
            registration_date,
            participants (
                full_name,
                phone,
                residence
            ),
            programs (
                title
            )
        `);

    if(error){

        alert(error.message);
        return;
    }

    let csv =

`Program,Participant,Phone,Residence,Registration Date
`;

    data.forEach(reg => {

        csv +=

`"${reg.programs.title}";
"${reg.participants.full_name}";
"${reg.participants.phone}";
"${reg.participants.residence}";
"${reg.registration_date}"
\n`;

    });

    const blob =
        new Blob([csv],
        {type:'text/csv'});

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement('a');

    a.href = url;

    a.download =
        'registrations.csv';

    a.click();

    URL.revokeObjectURL(url);
}*/


// Export Function excel

window.exportRegistrationsExcel =
async function() {

    const { data, error } =
        await supabaseClient
        .from('registrations')
        .select(`
            registration_date,
            participants (
                full_name,
                phone,
                residence
            ),
            programs (
                title
            )
        `);

    if(error){

        alert(error.message);
        return;
    }

    const excelData = data.map(reg => ({

        Program:
            reg.programs?.title || '',

        Participant:
            reg.participants?.full_name || '',

        Phone:
            reg.participants?.phone || '',

        Residence:
            reg.participants?.residence || '',

        Registration_Date:
            reg.registration_date || ''

    }));

    const worksheet =
        XLSX.utils.json_to_sheet(
            excelData
        );

    const workbook =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Registrations"
    );

    XLSX.writeFile(
        workbook,
        "Registrations.xlsx"
    );
}


// Cancel function

window.cancelEdit = function(){

    window.editingProgramId = null;

    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('venue').value = '';

    document.getElementById(
        'saveProgramBtn'
    ).innerText =
        "Create Program";

    document.getElementById(
        'cancelEditBtn'
    ).style.display =
        "none";

    document.getElementById(
        'cancelEditBtn'
    ).style.display =
        "none";

}
