import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';

const STEPS = ["방식 선택", "약관 동의", "정보 입력", "프로필 설정", "가입 완료"];

function Register({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();
  const { register } = useUser();

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div>
            <p style={{ color: "#aaa", fontSize: 14, textAlign: "center", marginBottom: 28 }}>
              원하는 방식으로 계정을 만들어 보세요.
            </p>
            <button onClick={() => setStep(2)} style={{
              width: "100%", background: "#4f8ef7", color: "#fff",
              border: "none", borderRadius: 10, padding: "15px 0",
              fontSize: 15, fontWeight: 600, cursor: "pointer", marginBottom: 20,
            }}>이메일로 가입하기</button>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#2e2e2e" }} />
              <span style={{ color: "#555", fontSize: 13 }}>또는</span>
              <div style={{ flex: 1, height: 1, background: "#2e2e2e" }} />
            </div>
            
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "#888" }}>
              이미 계정이 있나요?{" "}
              <span onClick={onBack} style={{ color: "#4f8ef7", cursor: "pointer" }}>로그인</span>
            </p>
          </div>
        );
      case 2:
        return (
          <div>
            <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, marginBottom: 4 }}>서비스 이용약관</p>
            <div style={{
              background: "#1c1c1c", border: "1px solid #2e2e2e", borderRadius: 10,
              padding: 16, height: 160, overflowY: "auto", fontSize: 12,
              color: "#888", marginBottom: 16, lineHeight: 1.7,
            }}>
              제1조 (목적) 본 약관은 상대성 시간 서비스 이용에 관한 조건 및 절차를 규정합니다.<br/>
              제2조 (이용자 의무) 이용자는 관련 법령 및 본 약관의 규정을 준수해야 합니다.<br/>
              제3조 (개인정보 보호) 서비스는 개인정보 보호법에 따라 이용자의 정보를 보호합니다.<br/>
              제4조 (서비스 이용) 서비스는 일정 조율 및 관련 기능을 제공합니다.<br/>
              제5조 (면책조항) 천재지변 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 24 }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                style={{ width: 16, height: 16, cursor: "pointer" }} />
              <span style={{ color: "#ccc", fontSize: 14 }}>약관에 동의합니다</span>
            </label>
            <button onClick={() => agreed && setStep(3)} style={{
              width: "100%", background: agreed ? "#4f8ef7" : "#2a2a2a",
              color: agreed ? "#fff" : "#555", border: "none",
              borderRadius: 10, padding: "15px 0", fontSize: 15,
              fontWeight: 600, cursor: agreed ? "pointer" : "default",
            }}>다음</button>
          </div>
        );
      case 3:
        return (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 6 }}>이메일</label>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요" type="email"
                style={{
                  width: "100%", background: "#1c1c1c", border: "1px solid #2e2e2e",
                  borderRadius: 10, padding: "13px 16px", fontSize: 14,
                  color: "#fff", outline: "none", boxSizing: "border-box",
                }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 6 }}>비밀번호</label>
              <input value={password} onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요" type="password"
                style={{
                  width: "100%", background: "#1c1c1c", border: "1px solid #2e2e2e",
                  borderRadius: 10, padding: "13px 16px", fontSize: 14,
                  color: "#fff", outline: "none", boxSizing: "border-box",
                }} />
            </div>
            <button onClick={() => { if(email && password) setStep(4); }} style={{
              width: "100%", background: "#4f8ef7", color: "#fff",
              border: "none", borderRadius: 10, padding: "15px 0",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>다음</button>
          </div>
        );
      case 4:
        return (
          <div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 13, color: "#aaa", marginBottom: 6 }}>닉네임</label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="닉네임을 입력하세요"
                style={{
                  width: "100%", background: "#1c1c1c", border: "1px solid #2e2e2e",
                  borderRadius: 10, padding: "13px 16px", fontSize: 14,
                  color: "#fff", outline: "none", boxSizing: "border-box",
                }} />
            </div>
            <button onClick={() => { if(name) setStep(5); }} style={{
              width: "100%", background: "#4f8ef7", color: "#fff",
              border: "none", borderRadius: 10, padding: "15px 0",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>다음</button>
          </div>
        );
      case 5:
        return (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>가입 완료!</p>
            <p style={{ color: "#aaa", fontSize: 14, marginBottom: 32 }}>
              상대성 시간에 오신 걸 환영해요, {name}님!
            </p>
            <button onClick={async () => {
              const result = await register(name, email, password);
              if (result.success) {
                navigate('/home');
              } else {
                alert(result.message);
              }
            }} style={{
              width: "100%", background: "#4f8ef7", color: "#fff",
              border: "none", borderRadius: 10, padding: "15px 0",
              fontSize: 15, fontWeight: 600, cursor: "pointer",
            }}>시작하기</button>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div style={{
      height: "100vh", background: "#111111",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 480, padding: "48px 40px 40px" }}>
        <h1 style={{
          fontSize: "2rem", fontWeight: 700, textAlign: "center",
          marginBottom: 28, color: "#fff",
        }}>상대성 시간</h1>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 0, marginBottom: 32 }}>
          {STEPS.map((label, i) => {
            const num = i + 1;
            const isActive = num === step;
            const isDone = num < step;
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  {i > 0 && <div style={{ flex: 1, height: 2, background: isDone ? "#4f8ef7" : "#2e2e2e" }} />}
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: isActive ? "#4f8ef7" : isDone ? "#4f8ef7" : "#2a2a2a",
                    color: isActive || isDone ? "#fff" : "#555",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{isDone ? "✓" : num}</div>
                  {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: isDone ? "#4f8ef7" : "#2e2e2e" }} />}
                </div>
                <span style={{ fontSize: 11, color: isActive ? "#fff" : "#555", marginTop: 6, fontWeight: isActive ? 600 : 400 }}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        <p style={{ color: "#fff", fontSize: 18, fontWeight: 700, textAlign: "center", marginBottom: 24 }}>
          {step === 1 ? "회원가입" : step === 2 ? "약관 동의" : step === 3 ? "정보 입력" : step === 4 ? "프로필 설정" : "가입 완료"}
        </p>

        {renderStep()}
      </div>
    </div>
  );
}

function Login() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const passwordRef = useRef(null);
  const navigate = useNavigate();
  const { login } = useUser();

  if (showRegister) {
    return <Register onBack={() => setShowRegister(false)} />;
  }

  const handleLogin = async () => {
  const id = userId.trim();
  const pw = password.trim();
  if (!id || !pw) {
    alert('아이디와 비밀번호를 입력해주세요.');
    return;
  }
  const result = await login(id, pw);
  if (result.success) {
    navigate('/home');
  } else {
    alert(result.message);
  }
};

  const handleUserIdKeyDown = (e) => {
    if (e.key === 'Enter') passwordRef.current.focus();
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  

  return (
    <div style={{
      height: "100vh", background: "#111111",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{
        width: "100%", maxWidth: 480,
        padding: "48px 40px 40px",
        animation: "fadeUp 0.5s ease both",
      }}>
        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <h1 style={{
          fontSize: "2rem", fontWeight: 700, textAlign: "center",
          marginBottom: 40, letterSpacing: "-0.5px", color: "#ffffff"
        }}>상대성 시간</h1>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#ffffff", marginBottom: 8 }}>아이디</label>
          <input
            type="text" placeholder="아이디를 입력하세요"
            value={userId} onChange={(e) => setUserId(e.target.value)}
            onKeyDown={handleUserIdKeyDown}
            style={{
              width: "100%", background: "#1c1c1c",
              border: "1px solid #2e2e2e", borderRadius: 10,
              padding: "15px 18px", fontSize: "0.92rem",
              color: "#ffffff", outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 500, color: "#ffffff", marginBottom: 8 }}>비밀번호</label>
          <input
            ref={passwordRef} type="password" placeholder="비밀번호를 입력하세요"
            value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handlePasswordKeyDown}
            style={{
              width: "100%", background: "#1c1c1c",
              border: "1px solid #2e2e2e", borderRadius: 10,
              padding: "15px 18px", fontSize: "0.92rem",
              color: "#ffffff", outline: "none",
              boxSizing: "border-box", fontFamily: "inherit",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button onClick={handleLogin} style={{
            flex: 1, padding: "15px 0", borderRadius: 10,
            fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
            border: "none", background: "#4f8ef7", color: "#fff",
            fontFamily: "inherit",
          }}>로그인</button>
          <button onClick={() => setShowRegister(true)} style={{
            flex: 1, padding: "15px 0", borderRadius: 10,
            fontSize: "0.95rem", fontWeight: 600, cursor: "pointer",
            background: "transparent", color: "#ffffff",
            border: "1px solid #3a3a3a", fontFamily: "inherit",
          }}>회원가입</button>
        </div>

        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", marginTop: 20
        }}>
          <span style={{ color: "#aaaaaa", fontSize: "0.82rem", textDecoration: "none", padding: "0 14px", cursor: "pointer" }}>아이디 찾기</span>
          <span style={{ color: "#3a3a3a", fontSize: "0.82rem" }}>|</span>
          <span style={{ color: "#aaaaaa", fontSize: "0.82rem", textDecoration: "none", padding: "0 14px", cursor: "pointer" }}>비밀번호 찾기</span>
        </div>

        
      </div>
    </div>
  );
}

export default Login;