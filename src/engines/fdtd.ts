export class FDTDEngine {
    nx: number;
    ny: number;
    dx: number;
    dy: number;
    dt: number;
    
    ez: Float32Array;
    hx: Float32Array;
    hy: Float32Array;
    eps: Float32Array;
    
    psi_ez_x: Float32Array;
    psi_ez_y: Float32Array;
    psi_hx_y: Float32Array;
    psi_hy_x: Float32Array;
    
    b_e_x: Float32Array;
    c_e_x: Float32Array;
    b_e_y: Float32Array;
    c_e_y: Float32Array;
    
    b_h_x: Float32Array;
    c_h_x: Float32Array;
    b_h_y: Float32Array;
    c_h_y: Float32Array;
    
    npml: number = 10;
    
    c = 299792458;
    eps0 = 8.854e-12;
    mu0 = 1.256e-6;
    
    step = 0;
    
    constructor(nx: number, ny: number, dx: number, dy: number) {
        this.nx = nx;
        this.ny = ny;
        this.dx = dx;
        this.dy = dy;
        
        this.dt = 1 / (this.c * Math.sqrt(1/(dx*dx) + 1/(dy*dy))) * 0.99;
        
        this.ez = new Float32Array(nx * ny);
        this.hx = new Float32Array(nx * ny);
        this.hy = new Float32Array(nx * ny);
        this.eps = new Float32Array(nx * ny);
        
        for (let i = 0; i < nx * ny; i++) this.eps[i] = this.eps0;
        
        this.psi_ez_x = new Float32Array(nx * ny);
        this.psi_ez_y = new Float32Array(nx * ny);
        this.psi_hx_y = new Float32Array(nx * ny);
        this.psi_hy_x = new Float32Array(nx * ny);
        
        this.b_e_x = new Float32Array(nx);
        this.c_e_x = new Float32Array(nx);
        this.b_e_y = new Float32Array(ny);
        this.c_e_y = new Float32Array(ny);
        
        this.b_h_x = new Float32Array(nx);
        this.c_h_x = new Float32Array(nx);
        this.b_h_y = new Float32Array(ny);
        this.c_h_y = new Float32Array(ny);
        
        this.initCPML();
    }
    
    initCPML() {
        const m = 4;
        const R_err = 1e-5;
        const sig_max = -(m + 1) * Math.log(R_err) / (2 * 120 * Math.PI * this.npml * this.dx);
        
        for (let i = 0; i < this.nx; i++) {
            let dist_e = 0;
            let dist_h = 0;
            
            if (i < this.npml) {
                dist_e = this.npml - i;
                dist_h = this.npml - i - 0.5;
            } else if (i > this.nx - 1 - this.npml) {
                dist_e = i - (this.nx - 1 - this.npml);
                dist_h = i - (this.nx - 1 - this.npml) + 0.5;
            }
            
            let sig_e = sig_max * Math.pow(dist_e / this.npml, m);
            let sig_h = sig_max * Math.pow(dist_h / this.npml, m);
            
            this.b_e_x[i] = Math.exp(-(sig_e) * this.dt / this.eps0);
            this.c_e_x[i] = (this.b_e_x[i] - 1.0) || 0;
            
            this.b_h_x[i] = Math.exp(-(sig_h) * this.dt / this.eps0);
            this.c_h_x[i] = (this.b_h_x[i] - 1.0) || 0;
        }
        
        for (let j = 0; j < this.ny; j++) {
            let dist_e = 0;
            let dist_h = 0;
            
            if (j < this.npml) {
                dist_e = this.npml - j;
                dist_h = this.npml - j - 0.5;
            } else if (j > this.ny - 1 - this.npml) {
                dist_e = j - (this.ny - 1 - this.npml);
                dist_h = j - (this.ny - 1 - this.npml) + 0.5;
            }
            
            let sig_e = sig_max * Math.pow(dist_e / this.npml, m);
            let sig_h = sig_max * Math.pow(dist_h / this.npml, m);
            
            this.b_e_y[j] = Math.exp(-(sig_e) * this.dt / this.eps0);
            this.c_e_y[j] = (this.b_e_y[j] - 1.0) || 0;
            
            this.b_h_y[j] = Math.exp(-(sig_h) * this.dt / this.eps0);
            this.c_h_y[j] = (this.b_h_y[j] - 1.0) || 0;
        }
    }
    
    update(sourcePos: {x: number, y: number}, sourceType: string, sourceFreq: number) {
        for (let i = 0; i < this.nx; i++) {
            for (let j = 0; j < this.ny - 1; j++) {
                const idx = i + j*this.nx;
                const idx_jp1 = i + (j+1)*this.nx;
                const diff_ez = this.ez[idx_jp1] - this.ez[idx];
                
                this.psi_hx_y[idx] = this.b_h_y[j] * this.psi_hx_y[idx] + this.c_h_y[j] * diff_ez / this.dy;
                this.hx[idx] -= (this.dt / this.mu0) * (diff_ez / this.dy + this.psi_hx_y[idx]);
            }
        }
        
        for (let i = 0; i < this.nx - 1; i++) {
            for (let j = 0; j < this.ny; j++) {
                const idx = i + j*this.nx;
                const idx_ip1 = (i+1) + j*this.nx;
                const diff_ez = this.ez[idx_ip1] - this.ez[idx];
                
                this.psi_hy_x[idx] = this.b_h_x[i] * this.psi_hy_x[idx] + this.c_h_x[i] * diff_ez / this.dx;
                this.hy[idx] += (this.dt / this.mu0) * (diff_ez / this.dx + this.psi_hy_x[idx]);
            }
        }
        
        for (let i = 1; i < this.nx - 1; i++) {
            for (let j = 1; j < this.ny - 1; j++) {
                const idx = i + j*this.nx;
                const idx_im1 = (i-1) + j*this.nx;
                const idx_jm1 = i + (j-1)*this.nx;
                
                const diff_hy = this.hy[idx] - this.hy[idx_im1];
                const diff_hx = this.hx[idx] - this.hx[idx_jm1];
                
                this.psi_ez_x[idx] = this.b_e_x[i] * this.psi_ez_x[idx] + this.c_e_x[i] * diff_hy / this.dx;
                this.psi_ez_y[idx] = this.b_e_y[j] * this.psi_ez_y[idx] + this.c_e_y[j] * diff_hx / this.dy;
                
                this.ez[idx] += (this.dt / this.eps[idx]) * (
                    (diff_hy / this.dx + this.psi_ez_x[idx]) - 
                    (diff_hx / this.dy + this.psi_ez_y[idx])
                );
            }
        }
        
        let t = this.step * this.dt;
        let srcVal = 0;
        if (sourceType === 'Continuous Wave') {
            srcVal = Math.sin(2 * Math.PI * sourceFreq * t);
        } else if (sourceType === 'Gaussian Pulse') {
            let t0 = 3 / sourceFreq;
            let sigma = 1 / sourceFreq;
            srcVal = Math.exp(-((t - t0)**2) / (sigma**2)) * Math.sin(2 * Math.PI * sourceFreq * t);
        }
        
        if (sourcePos.x >= 0 && sourcePos.x < this.nx && sourcePos.y >= 0 && sourcePos.y < this.ny) {
             this.ez[sourcePos.x + sourcePos.y*this.nx] += srcVal;
        }
        
        this.step++;
    }
}
