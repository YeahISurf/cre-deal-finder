# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    # Core development tools
    pkgs.git
    pkgs.curl
    pkgs.jq
    
    # Python environment for backend
    pkgs.python311
    pkgs.python311Packages.pip
    pkgs.python311Packages.virtualenv
    pkgs.python311Packages.pyyaml
    pkgs.python311Packages.python-dotenv
    pkgs.python311Packages.openai
    pkgs.python311Packages.streamlit
    
    # Node.js for Next.js frontend
    pkgs.nodejs_20
    pkgs.nodePackages.npm
    pkgs.nodePackages.yarn
    pkgs.nodePackages.pnpm
    
    # Useful development utilities
    pkgs.ripgrep  # Better grep
    pkgs.fd       # Better find
    pkgs.htop     # Process viewer
  ];

  # Sets environment variables in the workspace
  env = {
    # Placeholder for OpenAI API key - replace with your actual key or use .env files
    # OPENAI_API_KEY = "your-api-key";
    
    # Python settings
    PYTHONPATH = "/home/user/cre-deal-finder";
    
    # Node.js settings
    NODE_ENV = "development";
  };
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # Python extensions
      "ms-python.python"
      "ms-python.vscode-pylance"
      
      # JavaScript/TypeScript extensions
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
      
      # General development extensions
      "eamodio.gitlens"
      "github.copilot"
      "github.vscode-pull-request-github"
      "ms-vsliveshare.vsliveshare"
      "streetsidesoftware.code-spell-checker"
      "yzhang.markdown-all-in-one"
      
      # YAML support for configuration files
      "redhat.vscode-yaml"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        # Next.js frontend preview
        next-app = {
          command = ["bash" "-c" "cd next-app && npm run dev"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
        
        # Streamlit app preview (if you use it)
        streamlit = {
          command = ["bash" "-c" "streamlit run app.py"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Install Python dependencies
        install-python-deps = "pip install -r requirements.txt";
        
        # Install Next.js dependencies
        install-next-deps = "cd next-app && npm install";
        
        # Create necessary directories
        create-dirs = "mkdir -p logs output";
      };
      
      # Runs when the workspace is (re)started
      onStart = {
        # Check Python and Node.js versions
        check-versions = "echo 'Python:' && python --version && echo 'Node:' && node --version && echo 'NPM:' && npm --version";
      };
    };
  };
}
