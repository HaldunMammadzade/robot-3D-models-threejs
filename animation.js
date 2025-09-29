        let scene, camera, renderer;
        let robot = {};
        let mouseX = 0, mouseY = 0;
        let time = 0;
        let orbitRadius = 10;
        let orbitAngle = 0;
        
        function init() {
            // Create scene
            scene = new THREE.Scene();
            scene.fog = new THREE.FogExp2(0x0a0a0a, 0.015);
            
            // Setup camera
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.set(0, 5, 20);
            camera.lookAt(0, 0, 0);
            
            // Setup renderer
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            document.body.appendChild(renderer.domElement);
            
            // Add lighting
            const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
            scene.add(ambientLight);
            
            const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
            mainLight.position.set(10, 20, 10);
            mainLight.castShadow = true;
            mainLight.shadow.camera.left = -20;
            mainLight.shadow.camera.right = 20;
            mainLight.shadow.camera.top = 20;
            mainLight.shadow.camera.bottom = -20;
            scene.add(mainLight);
            
            const pointLight1 = new THREE.PointLight(0x00ffff, 1, 50);
            pointLight1.position.set(-10, 5, -10);
            scene.add(pointLight1);
            
            const pointLight2 = new THREE.PointLight(0xff00ff, 1, 50);
            pointLight2.position.set(10, 5, -10);
            scene.add(pointLight2);
            
            // Create ground plane
            const groundGeometry = new THREE.PlaneGeometry(50, 50, 20, 20);
            const groundMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a1a2e,
                roughness: 0.8,
                metalness: 0.2,
                wireframe: false
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.position.y = -3;
            ground.receiveShadow = true;
            scene.add(ground);
            
            // Add grid helper
            const gridHelper = new THREE.GridHelper(50, 50, 0x00ffff, 0x444444);
            gridHelper.position.y = -2.9;
            scene.add(gridHelper);
            
            // Create the robot
            createRobot();
            
            // Add environment objects
            createEnvironment();
            
            // Create particle system
            createParticles();
            
            // Event listeners
            document.addEventListener('mousemove', onMouseMove);
            window.addEventListener('resize', onWindowResize);
            
            animate();
        }
        
        function createRobot() {
            robot.group = new THREE.Group();
            
            // Robot body (metallic texture)
            const bodyGeometry = new THREE.BoxGeometry(2, 3, 1.5);
            const bodyMaterial = new THREE.MeshStandardMaterial({
                color: 0x2196F3,
                metalness: 0.8,
                roughness: 0.2
            });
            robot.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
            robot.body.castShadow = true;
            robot.body.position.y = 0;
            robot.group.add(robot.body);
            
            // Robot head
            const headGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
            const headMaterial = new THREE.MeshStandardMaterial({
                color: 0x42A5F5,
                metalness: 0.9,
                roughness: 0.1
            });
            robot.head = new THREE.Mesh(headGeometry, headMaterial);
            robot.head.castShadow = true;
            robot.head.position.y = 2.2;
            robot.group.add(robot.head);
            
            // Robot eyes (glowing)
            const eyeGeometry = new THREE.SphereGeometry(0.2, 16, 16);
            const eyeMaterial = new THREE.MeshStandardMaterial({
                color: 0x00ffff,
                emissive: 0x00ffff,
                emissiveIntensity: 1
            });
            
            robot.leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            robot.leftEye.position.set(-0.4, 2.3, 0.76);
            robot.group.add(robot.leftEye);
            
            robot.rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
            robot.rightEye.position.set(0.4, 2.3, 0.76);
            robot.group.add(robot.rightEye);
            
            // Antenna
            const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
            const antennaMaterial = new THREE.MeshStandardMaterial({
                color: 0xff6b6b,
                metalness: 0.7
            });
            robot.antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
            robot.antenna.position.y = 3.2;
            robot.group.add(robot.antenna);
            
            const antennaTipGeometry = new THREE.SphereGeometry(0.15, 16, 16);
            const antennaTipMaterial = new THREE.MeshStandardMaterial({
                color: 0xff0000,
                emissive: 0xff0000,
                emissiveIntensity: 0.8
            });
            robot.antennaTip = new THREE.Mesh(antennaTipGeometry, antennaTipMaterial);
            robot.antennaTip.position.y = 3.7;
            robot.group.add(robot.antennaTip);
            
            // Left arm
            const armGeometry = new THREE.BoxGeometry(0.5, 2, 0.5);
            const armMaterial = new THREE.MeshStandardMaterial({
                color: 0x1976D2,
                metalness: 0.7,
                roughness: 0.3
            });
            
            robot.leftArm = new THREE.Group();
            const leftUpperArm = new THREE.Mesh(armGeometry, armMaterial);
            leftUpperArm.castShadow = true;
            leftUpperArm.position.y = -0.5;
            robot.leftArm.add(leftUpperArm);
            robot.leftArm.position.set(-1.5, 0.5, 0);
            robot.group.add(robot.leftArm);
            
            // Right arm
            robot.rightArm = new THREE.Group();
            const rightUpperArm = new THREE.Mesh(armGeometry, armMaterial);
            rightUpperArm.castShadow = true;
            rightUpperArm.position.y = -0.5;
            robot.rightArm.add(rightUpperArm);
            robot.rightArm.position.set(1.5, 0.5, 0);
            robot.group.add(robot.rightArm);
            
            // Left leg
            const legGeometry = new THREE.BoxGeometry(0.6, 2.5, 0.6);
            robot.leftLeg = new THREE.Group();
            const leftLegMesh = new THREE.Mesh(legGeometry, armMaterial);
            leftLegMesh.castShadow = true;
            leftLegMesh.position.y = -1.25;
            robot.leftLeg.add(leftLegMesh);
            robot.leftLeg.position.set(-0.6, -2.8, 0);
            robot.group.add(robot.leftLeg);
            
            // Right leg
            robot.rightLeg = new THREE.Group();
            const rightLegMesh = new THREE.Mesh(legGeometry, armMaterial);
            rightLegMesh.castShadow = true;
            rightLegMesh.position.y = -1.25;
            robot.rightLeg.add(rightLegMesh);
            robot.rightLeg.position.set(0.6, -2.8, 0);
            robot.group.add(robot.rightLeg);
            
            robot.group.position.y = 3;
            scene.add(robot.group);
        }
        
        function createEnvironment() {
            // Create rotating platforms
            for (let i = 0; i < 5; i++) {
                const geometry = new THREE.TorusGeometry(2 + i, 0.3, 16, 100);
                const material = new THREE.MeshStandardMaterial({
                    color: Math.random() * 0xffffff,
                    metalness: 0.8,
                    roughness: 0.2,
                    wireframe: true
                });
                const torus = new THREE.Mesh(geometry, material);
                torus.position.y = -2 + i * 0.5;
                torus.rotation.x = Math.PI / 2;
                scene.add(torus);
            }
            
            // Create rotating cubes around the scene
            for (let i = 0; i < 10; i++) {
                const size = Math.random() * 0.8 + 0.3;
                const geometry = new THREE.BoxGeometry(size, size, size);
                const material = new THREE.MeshStandardMaterial({
                    color: Math.random() * 0xffffff,
                    metalness: 0.6,
                    roughness: 0.4
                });
                const cube = new THREE.Mesh(geometry, material);
                
                const angle = (i / 10) * Math.PI * 2;
                const radius = 15;
                cube.position.x = Math.cos(angle) * radius;
                cube.position.z = Math.sin(angle) * radius;
                cube.position.y = Math.random() * 10;
                cube.castShadow = true;
                
                scene.add(cube);
            }
        }
        
        function createParticles() {
            const particleGeometry = new THREE.BufferGeometry();
            const particleCount = 2000;
            const positions = new Float32Array(particleCount * 3);
            
            for (let i = 0; i < particleCount * 3; i++) {
                positions[i] = (Math.random() - 0.5) * 80;
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const particleMaterial = new THREE.PointsMaterial({
                color: 0xffffff,
                size: 0.15,
                transparent: true,
                opacity: 0.8
            });
            
            const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particleSystem);
        }
        
        function onMouseMove(event) {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }
        
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;
            
            // Robot head movements
            robot.head.rotation.y = Math.sin(time) * 0.3;
            robot.head.rotation.x = Math.sin(time * 0.5) * 0.1;
            
            // Arm swinging animation
            robot.leftArm.rotation.x = Math.sin(time * 2) * 0.5;
            robot.rightArm.rotation.x = Math.sin(time * 2 + Math.PI) * 0.5;
            
            // Leg walking animation
            robot.leftLeg.rotation.x = Math.sin(time * 2) * 0.3;
            robot.rightLeg.rotation.x = Math.sin(time * 2 + Math.PI) * 0.3;
            
            // Robot walking in circle
            robot.group.position.x = Math.sin(time * 0.5) * 5;
            robot.group.position.z = Math.cos(time * 0.5) * 5;
            robot.group.rotation.y = time * 0.5 + Math.PI / 2;
            
            // Eye blinking effect
            robot.leftEye.material.emissiveIntensity = Math.abs(Math.sin(time * 3)) * 1.5;
            robot.rightEye.material.emissiveIntensity = Math.abs(Math.sin(time * 3)) * 1.5;
            
            // Antenna vibration
            robot.antennaTip.position.y = 3.7 + Math.sin(time * 5) * 0.1;
            
            // Body rotation for looking around
            robot.body.rotation.y = Math.sin(time * 0.3) * 0.2;
            
            // Smooth camera orbit movement
            orbitAngle += 0.005;
            camera.position.x = Math.cos(orbitAngle) * orbitRadius + mouseX * 5;
            camera.position.z = Math.sin(orbitAngle) * orbitRadius + mouseY * 5;
            camera.position.y = 5 + mouseY * 3;
            camera.lookAt(robot.group.position);
            
            renderer.render(scene, camera);
        }
        
        init();