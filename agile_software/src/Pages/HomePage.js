import chapters from "../chapters";
import ChapterComponent from "../Components/ChapterComponent";
import useRequireAuth from '../AuthenticateUser';
import { signout } from '../firebase';
import {getUserRole} from '../GetUserRole';
import {getStudents} from '../GetStudents';
import {getUserName} from '../GetUserEmail';
import {getModerators} from '../GetModerators';

import {getUserProgress} from '../GetUserProgress';
import React, { useEffect, useState } from 'react';
import {getTitleById, getSubchapterCountById} from "../GetChapterInfo";
import "../Homepage.css"; 
import waterimg from "../Vattenskoter.png";

const handleSubmit = async (e) => {
  e.preventDefault();
  signout();
};

function calculateProgress(progressCount, chapter) {
  const totalCount = progressCount;
  const totalChapters = getSubchapterCountById(parseInt(chapter));
  const progressPercentage = (progressCount / totalChapters) * 100;

  return progressPercentage;
}


function HomePage() {
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [students, setStudents] = useState(null);
  const [moderators, setModerators] = useState(null);

  const [prog, setProgress] = useState(null);
  const currentUser = useRequireAuth();
  console.log("Debug 4 - after useRequireAuth user is: " + currentUser.uid)

  useEffect(() => {

    const fetchUserRole = async () => {
      try {
        const role = await getUserRole(currentUser);
        setUserRole(role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    const fetchUserName = async () => {
      try {
        //const userRef = doc(db, 'users', currentUser.uid);
        const name = await getUserName(currentUser.uid);
        setUserName(name);
      } catch (error) {
        console.error('Error fetching user name:', error);
      }
    };
    const fetchStudents = async() =>{
      try {
        const userStudents = await getStudents(currentUser);
        //const studentEmails = userStudents.forEach(getUserEmail)
        //const studentEmails = await userStudents.map((user) => getUserEmail(user));
        var studentUsernames = [];
        for(let i = 0; i<userStudents.length; i++){
          studentUsernames[i] = await getUserName(userStudents[i]);
        }
        //const studentEmails = await getUserEmail(userStudents[0]);
        setStudents(studentUsernames);
      }
      catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    const fetchModerators = async() =>{
      try {
        const userModerators = await getModerators(currentUser);
        //const studentEmails = userStudents.forEach(getUserEmail)
        //const studentEmails = await userStudents.map((user) => getUserEmail(user));
        var moderatorUsernames = [];
        for(let i = 0; i<userModerators.length; i++){
          moderatorUsernames[i] = await getUserName(userModerators[i]);
        }
        //const studentEmails = await getUserEmail(userStudents[0]);
        setModerators(moderatorUsernames);
      }
      catch (error) {
        console.error('Error fetching moderators:', error);
      }
    };
  
    const fetchUserProgress = async () => {
      try {
        const userStudents = await getStudents(currentUser);

        var studentProgress = [];
        for(let i = 0; i<userStudents.length; i++){
        
          var userProgress = await getUserProgress(userStudents[i]);
          var userProgCount = new Map();
          try{ 
          
            for(let i = 0; i<userProgress.length;i++){
              if(userProgCount.get(userProgress[i].chapter)){
                userProgCount.set(userProgress[i].chapter, userProgCount.get(userProgress[i].chapter)+1);
              }
              else{
                userProgCount.set(userProgress[i].chapter,1);
              }
            }


            studentProgress[i] = userProgCount;

          }
          catch (error){
            console.error("Error fetching user progress", error)
          }
          
        }
        setProgress(studentProgress)
      } catch (error) {
        console.error('Error fetching user progress:', error);
      }
    };

      fetchUserRole();
      if(userRole === "teacher"){
        fetchStudents();
      }else if(userRole === "supermoderator"){
        fetchModerators();
      }
      fetchUserName();
       fetchUserProgress();
  }, [currentUser, userRole]);

  
  if(userRole === "student")
  return (
    <div className="chapter-container">
      <header className="title-box">
      <div >
      <h1 className = "title">
        Välkommen till din utbildning {userName}
      </h1>
      </div>
      </header>
      <div className="chapter-list">
      {chapters.map((chapter) => (
        // <ChapterComponent chapter={chapter} key={chapter.id} />
        <li className="chapter-item" key={chapter.id}>
        <ChapterComponent chapter={chapter} />
      </li>
      ))}
      </div>
      <div className="waterimg">
        <img src={process.env.PUBLIC_URL + "/Images/Water.png"} alt="" />
      </div>
      <footer>
          <form onSubmit={handleSubmit}>
        <input type="submit" value="Logga ut" className="logout-btn" style={{ position: "relative", width: "200px",  marginLeft: "1400px", marginTop: "-1100px"}}/>
      </form>
      </footer>
    </div>
  );
  else if(userRole === "teacher"){
    return(
      <div className="students-container">
        <div className = "students-child">
          <h1>
            Dina studenter
          </h1>
          <div className="student-boxes">
            {students && students.map((student, index) => (
              <div className="student-box" key={student}>
                <div className="student-name">{student}</div>
                {prog && prog[index] && (
                  <ul className="progress-bars" style={{ listStyleType: 'none', padding: 0 }}>
                 {Array.from(prog[index].entries()).map(([chapter, count]) => (
                  <li key={chapter}>
                    <div className="progress-container">
                      <span className="chapter-title">{chapter}. {getTitleById(parseInt(chapter))}: </span>
                      <progress className="progress-bar" value={calculateProgress(prog[index].get(chapter), chapter)} max={100} />
                    </div>
                  </li>
                ))}
                  </ul>

                )}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <input type="submit" value="Logga ut" className="login-button" />
          </form>
        </div>
      </div>
    )
  }
  else if(userRole === "supermoderator"){
    console.log("userrole is: " + userRole)
    return(
      <div className="students-container">
        <div className = "students-child">
          <h1>
            Dina kunder 
          </h1>
          <div className="student-boxes">
            {moderators && moderators.map((moderator) => (
              <div className="student-box" key={moderator}>
                {moderator}
              </div>
              ))
            }
            {/* {students.map((student) => <li>{student}</li>)} */}
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <input type="submit" value="Logga ut" className="login-button" />
          </form>
        </div>
      </div>
    )
  }
  else{
    console.log("userRole error"&{userRole})
  }
}

export default HomePage;
